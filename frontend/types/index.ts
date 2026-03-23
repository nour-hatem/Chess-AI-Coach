export type GameStatus = 'pending' | 'processing' | 'done' | 'failed'

export interface GameUploadResponse {
  game_id: string
  status: GameStatus
  message: string
}

export interface GameStatusResponse {
  game_id: string
  status: GameStatus
  error_message: string | null
  created_at: string
  processed_at: string | null
}

export interface PhaseStats {
  white_acpl: number | null
  black_acpl: number | null
}

export interface GameReport {
  game_id: string
  accuracy_white: number
  accuracy_black: number
  blunders_white: number
  blunders_black: number
  mistakes_white: number
  mistakes_black: number
  inaccuracies_white: number
  inaccuracies_black: number
  avg_centipawn_loss_white: number
  avg_centipawn_loss_black: number
  phase_breakdown: {
    opening: PhaseStats
    middlegame: PhaseStats
    endgame: PhaseStats
  }
}

export interface Move {
  move_number: number
  color: 'white' | 'black'
  san: string
  uci: string
  eval_before: number | null
  eval_after: number | null
  eval_delta: number | null
  is_blunder: boolean
  is_mistake: boolean
  is_inaccuracy: boolean
  best_move_uci: string | null
  phase: 'opening' | 'middlegame' | 'endgame'
  clock_remaining: number | null
}
