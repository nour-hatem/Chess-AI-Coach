from __future__ import annotations

import math
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.game import Move


def _accuracy_from_acpl(acpl: float) -> float:
    if acpl <= 0:
        return 100.0
    return max(0.0, min(100.0, 103.1668 * math.exp(-0.04354 * acpl) - 3.1669))


def build_report(moves: list[Move]) -> dict:
    def stats_for(color: str) -> dict:
        color_moves = [m for m in moves if m.color == color and m.eval_delta is not None]
        if not color_moves:
            return {
                "blunders": 0,
                "mistakes": 0,
                "inaccuracies": 0,
                "acpl": 0.0,
                "accuracy": 100.0,
            }

        acpl = sum(m.eval_delta for m in color_moves) / len(color_moves)
        return {
            "blunders": sum(1 for m in color_moves if m.is_blunder),
            "mistakes": sum(1 for m in color_moves if m.is_mistake),
            "inaccuracies": sum(1 for m in color_moves if m.is_inaccuracy),
            "acpl": round(acpl, 2),
            "accuracy": round(_accuracy_from_acpl(acpl), 2),
        }

    white = stats_for("white")
    black = stats_for("black")

    phases = ["opening", "middlegame", "endgame"]
    phase_breakdown: dict = {}

    for phase in phases:
        pw = [m for m in moves if m.color == "white" and m.phase.value == phase and m.eval_delta is not None]
        pb = [m for m in moves if m.color == "black" and m.phase.value == phase and m.eval_delta is not None]
        phase_breakdown[phase] = {
            "white_acpl": round(sum(m.eval_delta for m in pw) / len(pw), 2) if pw else None,
            "black_acpl": round(sum(m.eval_delta for m in pb) / len(pb), 2) if pb else None,
        }

    return {
        "accuracy_white": white["accuracy"],
        "accuracy_black": black["accuracy"],
        "blunders_white": white["blunders"],
        "blunders_black": black["blunders"],
        "mistakes_white": white["mistakes"],
        "mistakes_black": black["mistakes"],
        "inaccuracies_white": white["inaccuracies"],
        "inaccuracies_black": black["inaccuracies"],
        "avg_centipawn_loss_white": white["acpl"],
        "avg_centipawn_loss_black": black["acpl"],
        "phase_breakdown": phase_breakdown,
    }
