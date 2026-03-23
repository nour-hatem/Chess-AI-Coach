from __future__ import annotations

import os
from typing import Optional

import chess
import chess.engine

from app.config import settings


class StockfishService:
    def __init__(self) -> None:
        self._engine: Optional[chess.engine.SimpleEngine] = None

    def _get_engine(self) -> chess.engine.SimpleEngine:
        if self._engine is None or not self._engine.is_alive():
            path = settings.STOCKFISH_PATH
            if not os.path.isfile(path):
                raise RuntimeError(
                    f"Stockfish binary not found at '{path}'. "
                    "Update STOCKFISH_PATH in your .env file."
                )
            self._engine = chess.engine.SimpleEngine.popen_uci(path)
            self._engine.configure({
                "Threads": settings.STOCKFISH_THREADS,
                "Hash": settings.STOCKFISH_HASH_MB,
            })
        return self._engine

    def evaluate_position(self, fen: str, depth: Optional[int] = None) -> Optional[float]:
        depth = depth or settings.STOCKFISH_DEPTH
        engine = self._get_engine()
        board = chess.Board(fen)

        try:
            info = engine.analyse(board, chess.engine.Limit(depth=depth))
            score = info["score"].white()
            if score.is_mate():
                mate_in = score.mate()
                return 10000.0 if mate_in > 0 else -10000.0
            return float(score.score())
        except Exception:
            return None

    def get_best_move(self, fen: str, depth: Optional[int] = None) -> Optional[str]:
        depth = depth or settings.STOCKFISH_DEPTH
        engine = self._get_engine()
        board = chess.Board(fen)

        try:
            result = engine.play(board, chess.engine.Limit(depth=depth))
            return result.move.uci() if result.move else None
        except Exception:
            return None

    def close(self) -> None:
        if self._engine:
            try:
                self._engine.quit()
            except Exception:
                pass
            self._engine = None


stockfish_service = StockfishService()
