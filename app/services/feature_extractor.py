from __future__ import annotations

from typing import Optional

import chess


def extract_move_features(fen_before: str, uci: str) -> dict:
    board = chess.Board(fen_before)
    move = chess.Move.from_uci(uci)

    moving_piece = board.piece_at(move.from_square)

    features = {
        "piece_count": len(board.piece_map()),
        "legal_moves_count": board.legal_moves.count(),
        "is_capture": board.is_capture(move),
        "is_check": _gives_check(board, move),
        "is_castling": board.is_castling(move),
        "is_promotion": move.promotion is not None,
        "moving_piece_type": moving_piece.piece_type if moving_piece else None,
        "material_balance": _material_balance(board),
        "king_safety_white": _king_safety(board, chess.WHITE),
        "king_safety_black": _king_safety(board, chess.BLACK),
        "pawn_structure": _pawn_structure(board),
        "center_control": _center_control(board),
    }

    return features


def _gives_check(board: chess.Board, move: chess.Move) -> bool:
    board_copy = board.copy()
    board_copy.push(move)
    return board_copy.is_check()


def _material_balance(board: chess.Board) -> float:
    piece_values = {
        chess.PAWN: 1,
        chess.KNIGHT: 3,
        chess.BISHOP: 3,
        chess.ROOK: 5,
        chess.QUEEN: 9,
        chess.KING: 0,
    }
    balance = 0.0
    for _, piece in board.piece_map().items():
        value = piece_values[piece.piece_type]
        balance += value if piece.color == chess.WHITE else -value
    return balance


def _king_safety(board: chess.Board, color: chess.Color) -> int:
    king_sq = board.king(color)
    if king_sq is None:
        return 0
    return len(board.attackers(not color, king_sq))


def _pawn_structure(board: chess.Board) -> dict:
    white_pawns = list(board.pieces(chess.PAWN, chess.WHITE))
    black_pawns = list(board.pieces(chess.PAWN, chess.BLACK))

    def doubled(pawns: list) -> int:
        files = [chess.square_file(p) for p in pawns]
        return sum(1 for f in set(files) if files.count(f) > 1)

    def isolated(pawns: list) -> int:
        files = {chess.square_file(p) for p in pawns}
        return sum(1 for f in files if f - 1 not in files and f + 1 not in files)

    return {
        "white_doubled_pawns": doubled(white_pawns),
        "black_doubled_pawns": doubled(black_pawns),
        "white_isolated_pawns": isolated(white_pawns),
        "black_isolated_pawns": isolated(black_pawns),
    }


def _center_control(board: chess.Board) -> dict:
    center_squares = [chess.D4, chess.D5, chess.E4, chess.E5]
    return {
        "white": sum(1 for sq in center_squares if board.is_attacked_by(chess.WHITE, sq)),
        "black": sum(1 for sq in center_squares if board.is_attacked_by(chess.BLACK, sq)),
    }
