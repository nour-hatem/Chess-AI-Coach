from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class GameUploadRequest(BaseModel):
    pgn: str


class GameUploadResponse(BaseModel):
    game_id: UUID
    status: str
    message: str


class GameStatusOut(BaseModel):
    game_id: UUID
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    processed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MoveOut(BaseModel):
    move_number: int
    color: str
    san: str
    uci: str
    eval_before: Optional[float] = None
    eval_after: Optional[float] = None
    eval_delta: Optional[float] = None
    is_blunder: bool
    is_mistake: bool
    is_inaccuracy: bool
    best_move_uci: Optional[str] = None
    phase: str
    clock_remaining: Optional[float] = None

    class Config:
        from_attributes = True


class GameReportOut(BaseModel):
    game_id: UUID
    accuracy_white: float
    accuracy_black: float
    blunders_white: int
    blunders_black: int
    mistakes_white: int
    mistakes_black: int
    inaccuracies_white: int
    inaccuracies_black: int
    avg_centipawn_loss_white: float
    avg_centipawn_loss_black: float
    phase_breakdown: dict

    class Config:
        from_attributes = True
