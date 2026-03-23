'use client'

import type { GameReport } from '@/types'

interface PhaseBreakdownProps {
  report: GameReport
}

function PhaseRow({
  phase,
  whiteAcpl,
  blackAcpl,
}: {
  phase: string
  whiteAcpl: number | null
  blackAcpl: number | null
}) {
  const format = (v: number | null) => (v === null ? '—' : v.toFixed(1))

  const acplToColor = (v: number | null): string => {
    if (v === null) return '#ffffff20'
    if (v < 15) return '#52b052'
    if (v < 30) return '#c9a84c'
    if (v < 60) return '#e09052'
    return '#e05252'
  }

  return (
    <div className="py-3 border-b border-white/5 last:border-0">
      <div className="font-mono text-xs text-bone/30 uppercase tracking-widest mb-2">{phase}</div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-bone/20 font-mono mb-1">White ACPL</div>
          <div className="font-display text-xl" style={{ color: acplToColor(whiteAcpl) }}>
            {format(whiteAcpl)}
          </div>
        </div>
        <div>
          <div className="text-xs text-bone/20 font-mono mb-1">Black ACPL</div>
          <div className="font-display text-xl" style={{ color: acplToColor(blackAcpl) }}>
            {format(blackAcpl)}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PhaseBreakdown({ report }: PhaseBreakdownProps) {
  const { phase_breakdown } = report

  return (
    <div className="border border-white/8 rounded-xl p-6 bg-ink-soft/30">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-amber-chess">◈</span>
        <h3 className="font-mono text-xs uppercase tracking-widest text-bone/40">Phase Breakdown</h3>
      </div>

      <PhaseRow
        phase="Opening"
        whiteAcpl={phase_breakdown.opening.white_acpl}
        blackAcpl={phase_breakdown.opening.black_acpl}
      />
      <PhaseRow
        phase="Middlegame"
        whiteAcpl={phase_breakdown.middlegame.white_acpl}
        blackAcpl={phase_breakdown.middlegame.black_acpl}
      />
      <PhaseRow
        phase="Endgame"
        whiteAcpl={phase_breakdown.endgame.white_acpl}
        blackAcpl={phase_breakdown.endgame.black_acpl}
      />

      <div className="mt-4 pt-3 border-t border-white/5">
        <div className="text-xs font-mono text-bone/20">ACPL = avg centipawn loss</div>
      </div>
    </div>
  )
}
