from __future__ import annotations

import asyncio
import uuid
from datetime import datetime

from celery import Task

from app.worker.celery_app import celery_app
from app.database import AsyncSessionLocal
from app.models.game import Game, Move, GameReport, GamePhase
from app.services.pgn_parser import parse_pgn
from app.services.stockfish_service import stockfish_service
from app.services.feature_extractor import extract_move_features
from app.services.report_builder import build_report


def _run(coro):
    try:
        loop = asyncio.get_event_loop()
        if loop.is_closed():
            raise RuntimeError
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(coro)


class DatabaseTask(Task):
    pass


@celery_app.task(bind=True, base=DatabaseTask, max_retries=2, default_retry_delay=30)
def process_game(self, game_id: str) -> None:
    _run(_process_game_async(game_id))


async def _process_game_async(game_id: str) -> None:
    from sqlalchemy import select

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Game).where(Game.id == uuid.UUID(game_id)))
        game = result.scalar_one_or_none()

        if not game:
            return

        game.status = "processing"
        await db.commit()

        try:
            parsed = parse_pgn(game.pgn_raw)

            game.white_player = parsed.white_player
            game.black_player = parsed.black_player
            game.white_elo = parsed.white_elo
            game.black_elo = parsed.black_elo
            game.result = parsed.result
            game.opening_eco = parsed.opening_eco
            game.opening_name = parsed.opening_name
            game.total_moves = parsed.total_moves

            move_objects: list[Move] = []

            for pm in parsed.moves:
                eval_before = stockfish_service.evaluate_position(pm.fen_before)
                eval_after = stockfish_service.evaluate_position(pm.fen_after)
                best_move = stockfish_service.get_best_move(pm.fen_before)

                delta: float | None = None
                if eval_before is not None and eval_after is not None:
                    if pm.color == "white":
                        delta = eval_before - eval_after
                    else:
                        delta = eval_after - eval_before
                    delta = max(0.0, delta)

                features = extract_move_features(pm.fen_before, pm.uci)

                move_obj = Move(
                    game_id=game.id,
                    move_number=pm.move_number,
                    color=pm.color,
                    uci=pm.uci,
                    san=pm.san,
                    fen_before=pm.fen_before,
                    fen_after=pm.fen_after,
                    clock_remaining=pm.clock_remaining,
                    eval_before=eval_before,
                    eval_after=eval_after,
                    eval_delta=delta,
                    is_blunder=delta is not None and delta >= 200,
                    is_mistake=delta is not None and 100 <= delta < 200,
                    is_inaccuracy=delta is not None and 50 <= delta < 100,
                    best_move_uci=best_move,
                    phase=GamePhase(pm.phase),
                    features=features,
                )
                move_objects.append(move_obj)

            db.add_all(move_objects)
            await db.flush()

            report_data = build_report(move_objects)
            report = GameReport(game_id=game.id, **report_data)
            db.add(report)

            game.status = "done"
            game.processed_at = datetime.utcnow()
            await db.commit()

        except Exception as exc:
            game.status = "failed"
            game.error_message = str(exc)
            await db.commit()
            raise self.retry(exc=exc)
