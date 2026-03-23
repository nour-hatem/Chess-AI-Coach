import uuid
import enum
from datetime import datetime

from sqlalchemy import (
    Column, String, Integer, Float, Boolean,
    DateTime, ForeignKey, Text, Enum,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class GamePhase(str, enum.Enum):
    opening = "opening"
    middlegame = "middlegame"
    endgame = "endgame"


class Game(Base):
    __tablename__ = "games"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pgn_raw = Column(Text, nullable=False)
    white_player = Column(String(100))
    black_player = Column(String(100))
    white_elo = Column(Integer, nullable=True)
    black_elo = Column(Integer, nullable=True)
    result = Column(String(10))
    opening_eco = Column(String(10), nullable=True)
    opening_name = Column(String(200), nullable=True)
    total_moves = Column(Integer, nullable=True)
    status = Column(String(20), default="pending")
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)

    moves = relationship("Move", back_populates="game", cascade="all, delete-orphan")
    report = relationship("GameReport", back_populates="game", uselist=False, cascade="all, delete-orphan")


class Move(Base):
    __tablename__ = "moves"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    game_id = Column(UUID(as_uuid=True), ForeignKey("games.id"), nullable=False)
    move_number = Column(Integer, nullable=False)
    color = Column(String(5), nullable=False)
    uci = Column(String(10), nullable=False)
    san = Column(String(20), nullable=False)
    fen_before = Column(Text, nullable=False)
    fen_after = Column(Text, nullable=False)
    clock_remaining = Column(Float, nullable=True)
    eval_before = Column(Float, nullable=True)
    eval_after = Column(Float, nullable=True)
    eval_delta = Column(Float, nullable=True)
    is_blunder = Column(Boolean, default=False)
    is_mistake = Column(Boolean, default=False)
    is_inaccuracy = Column(Boolean, default=False)
    best_move_uci = Column(String(10), nullable=True)
    phase = Column(Enum(GamePhase), nullable=False)
    features = Column(JSONB, nullable=True)

    game = relationship("Game", back_populates="moves")


class GameReport(Base):
    __tablename__ = "game_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    game_id = Column(UUID(as_uuid=True), ForeignKey("games.id"), nullable=False, unique=True)
    accuracy_white = Column(Float)
    accuracy_black = Column(Float)
    blunders_white = Column(Integer)
    blunders_black = Column(Integer)
    mistakes_white = Column(Integer)
    mistakes_black = Column(Integer)
    inaccuracies_white = Column(Integer)
    inaccuracies_black = Column(Integer)
    avg_centipawn_loss_white = Column(Float)
    avg_centipawn_loss_black = Column(Float)
    phase_breakdown = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow)

    game = relationship("Game", back_populates="report")
