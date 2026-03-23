from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.game import Game, GameReport, Move
from app.schemas.game import (
    GameReportOut,
    GameStatusOut,
    GameUploadRequest,
    GameUploadResponse,
    MoveOut,
)
from app.services.pgn_parser import parse_pgn
from app.worker.tasks import process_game

router = APIRouter()


@router.post(
    "/upload",
    response_model=GameUploadResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Upload a PGN game for analysis",
)
async def upload_game(
    payload: GameUploadRequest,
    db: AsyncSession = Depends(get_db),
) -> GameUploadResponse:
    try:
        parse_pgn(payload.pgn)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    game = Game(pgn_raw=payload.pgn)
    db.add(game)
    await db.commit()
    await db.refresh(game)

    process_game.delay(str(game.id))

    return GameUploadResponse(
        game_id=game.id,
        status="pending",
        message="Game queued for analysis.",
    )


@router.get(
    "/{game_id}/status",
    response_model=GameStatusOut,
    summary="Poll processing status of a game",
)
async def get_game_status(
    game_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> GameStatusOut:
    result = await db.execute(select(Game).where(Game.id == game_id))
    game = result.scalar_one_or_none()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found.")
    return game


@router.get(
    "/{game_id}/report",
    response_model=GameReportOut,
    summary="Get the analysis report for a completed game",
)
async def get_game_report(
    game_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> GameReportOut:
    result = await db.execute(
        select(GameReport).where(GameReport.game_id == game_id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not ready. Check /status first.",
        )
    return report


@router.get(
    "/{game_id}/moves",
    response_model=list[MoveOut],
    summary="Get all evaluated moves for a game",
)
async def get_game_moves(
    game_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[MoveOut]:
    result = await db.execute(
        select(Move)
        .where(Move.game_id == game_id)
        .order_by(Move.move_number)
    )
    moves = result.scalars().all()
    if not moves:
        raise HTTPException(
            status_code=404,
            detail="No moves found. Game may still be processing.",
        )
    return moves


@router.delete(
    "/{game_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a game and all its data",
)
async def delete_game(
    game_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(select(Game).where(Game.id == game_id))
    game = result.scalar_one_or_none()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found.")
    await db.delete(game)
    await db.commit()
