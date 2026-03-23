'use client'

import type { GameReport } from '@/types'

interface AccuracyCardProps {
  report: GameReport
}

function AccuracyBar({ value, label }: { value: number; label: string }) {
  const color =
    value >= 85 ? '#52b052' :
    value >= 70 ? '#c9a84c' :
    value >= 55 ? '#e09052' : '#e05252'

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="font-mono text-xs text-bone/40 uppercase tracking-widest">{label}</span>
        <span className="font-display text-2xl" style={{ color }}>{value.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export function AccuracyCard({ report }: AccuracyCardProps) {
  return (
    <div className="border border-white/8 rounded-xl p-6 bg-ink-soft/30">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-amber-chess">◈</span>
        <h3 className="font-mono text-xs uppercase tracking-widest text-bone/40">Accuracy</h3>
      </div>
      <AccuracyBar value={report.accuracy_white} label="White" />
      <AccuracyBar value={report.accuracy_black} label="Black" />
      <div className="border-t border-white/5 pt-4 mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="font-mono text-xs text-bone/30 mb-1">White ACPL</div>
          <div className="font-display text-xl text-bone">{report.avg_centipawn_loss_white.toFixed(1)}</div>
        </div>
        <div>
          <div className="font-mono text-xs text-bone/30 mb-1">Black ACPL</div>
          <div className="font-display text-xl text-bone">{report.avg_centipawn_loss_black.toFixed(1)}</div>
        </div>
      </div>
    </div>
  )
}
