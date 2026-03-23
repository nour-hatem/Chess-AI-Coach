'use client'

import type { GameReport } from '@/types'

interface BlunderSummaryProps {
  report: GameReport
}

function StatRow({
  label,
  white,
  black,
  color,
}: {
  label: string
  white: number
  black: number
  color: string
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="font-mono text-sm text-bone/60">{label}</span>
      </div>
      <div className="flex gap-6 font-mono text-sm">
        <span style={{ color: white > 0 ? color : undefined }} className={white === 0 ? 'text-bone/20' : ''}>
          {white}W
        </span>
        <span style={{ color: black > 0 ? color : undefined }} className={black === 0 ? 'text-bone/20' : ''}>
          {black}B
        </span>
      </div>
    </div>
  )
}

export function BlunderSummary({ report }: BlunderSummaryProps) {
  const totalMistakes =
    report.blunders_white + report.blunders_black +
    report.mistakes_white + report.mistakes_black +
    report.inaccuracies_white + report.inaccuracies_black

  return (
    <div className="border border-white/8 rounded-xl p-6 bg-ink-soft/30">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-amber-chess">◈</span>
        <h3 className="font-mono text-xs uppercase tracking-widest text-bone/40">Errors</h3>
      </div>

      <StatRow
        label="Blunders"
        white={report.blunders_white}
        black={report.blunders_black}
        color="#e05252"
      />
      <StatRow
        label="Mistakes"
        white={report.mistakes_white}
        black={report.mistakes_black}
        color="#e09052"
      />
      <StatRow
        label="Inaccuracies"
        white={report.inaccuracies_white}
        black={report.inaccuracies_black}
        color="#e0c852"
      />

      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="font-mono text-xs text-bone/30 mb-1">Total errors</div>
        <div className="font-display text-3xl text-bone">{totalMistakes}</div>
      </div>
    </div>
  )
}
