from __future__ import annotations

import io
import re
from dataclasses import dataclass, field
from typing import Optional

import chess
import chess.pgn


@dataclass
class ParsedMove:
    move_number: int
    color: str
    uci: str
    san: str
    fen_before: str
    fen_after: str
    clock_remaining: Optional[float]
    phase: str


@dataclass
class ParsedGame:
    white_player: str
    black_player: str
    white_elo: Optional[int]
    black_elo: Optional[int]
    result: str
    opening_eco: Optional[str]
    opening_name: Optional[str]
    total_moves: int
    moves: list[ParsedMove] = field(default_factory=list)


def _classify_phase(board: chess.Board) -> str:
    if board.fullmove_number <= 10:
        return "opening"
    if len(board.piece_map()) <= 12:
        return "endgame"
    return "middlegame"


def _parse_clock(comment: str) -> Optional[float]:
    match = re.search(r'\[%clk\s+(\d+):(\d+):(\d+)\]', comment)
    if match:
        h, m, s = int(match.group(1)), int(match.group(2)), int(match.group(3))
        return h * 3600 + m * 60 + s
    return None


def _safe_int(value: str) -> Optional[int]:
    try:
        return int(value)
    except (ValueError, TypeError):
        return None


def parse_pgn(pgn_text: str) -> ParsedGame:
    pgn_text = pgn_text.strip()
    if not pgn_text:
        raise ValueError("PGN text is empty.")

    pgn_io = io.StringIO(pgn_text)
    game = chess.pgn.read_game(pgn_io)

    if game is None:
        raise ValueError("Invalid PGN: could not parse game.")

    headers = game.headers

    parsed = ParsedGame(
        white_player=headers.get("White", "Unknown"),
        black_player=headers.get("Black", "Unknown"),
        white_elo=_safe_int(headers.get("WhiteElo")),
        black_elo=_safe_int(headers.get("BlackElo")),
        result=headers.get("Result", "*"),
        opening_eco=headers.get("ECO"),
        opening_name=headers.get("Opening"),
        total_moves=0,
    )

    board = game.board()
    move_number = 0

    for node in game.mainline():
        move = node.move
        color = "white" if board.turn == chess.WHITE else "black"
        fen_before = board.fen()
        san = board.san(move)
        clock = _parse_clock(node.comment)
        phase = _classify_phase(board)

        board.push(move)
        move_number += 1

        parsed.moves.append(ParsedMove(
            move_number=move_number,
            color=color,
            uci=move.uci(),
            san=san,
            fen_before=fen_before,
            fen_after=board.fen(),
            clock_remaining=clock,
            phase=phase,
        ))

    parsed.total_moves = move_number
    return parsed
