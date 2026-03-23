'use client'

import { useRef, useEffect } from 'react'
import clsx from 'clsx'
import type { Move } from '@/types'

interface MovesTableProps {
  moves: Move[]
  selectedIndex: number
  onSelectMove: (index: number) => void
}

function MoveClassBadge({ move }: { move: Move }) {
  if (move.is_blunder)
    return <span className="text-signal-blunder font-mono text-xs">?!</span>
  if (move.is_mistake)
    return <span className="text-signal-mistake font-mono text-xs">?</span>
  if (move.is_inaccuracy)
    return <span className="text-signal-inaccuracy font-mono text-xs">⁈</span>
  return null
}

function deltaColor(delta: number | null): string {
  if (delta === null) return 'text-bone/20'
  if (delta < 10) return 'text-signal-good'
  if (delta < 50) return 'text-bone/60'
  if (delta < 100) return 'text-signal-inaccuracy'
  if (delta < 200) return 'text-signal-mistake'
  return 'text-signal-blunder'
}

function formatClock(seconds: number | null): string {
  if (seconds === null) return '—'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MovesTable({ moves, selectedIndex, onSelectMove }: MovesTableProps) {
  const selectedRef = useRef<HTMLTableRowElement | null>(null)

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedIndex])

  // Group into pairs (white + black per row)
  const pairs: Array<{ white: Move; black: Move | null; pairIndex: number }> = []
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      white: moves[i],
      black: moves[i + 1] ?? null,
      pairIndex: Math.floor(i / 2),
    })
  }

  return (
    <div className="border border-white/8 rounded-xl overflow-hidden bg-ink-soft/20">
      {/* Filter bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <span className="font-mono text-xs text-bone/30 uppercase tracking-widest">
          Move list · {moves.length} plies
        </span>
        <div className="flex gap-3 font-mono text-xs">
          <span className="text-signal-blunder">■ blunder</span>
          <span className="text-signal-mistake">■ mistake</span>
          <span className="text-signal-inaccuracy">■ inaccuracy</span>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[560px]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-ink-soft z-10">
            <tr className="border-b border-white/5">
              <th className="px-4 py-2 text-left font-mono text-xs text-bone/20 w-10">#</th>
              <th className="px-4 py-2 text-left font-mono text-xs text-bone/20">White</th>
              <th className="px-4 py-2 text-right font-mono text-xs text-bone/20">Loss</th>
              <th className="px-4 py-2 text-right font-mono text-xs text-bone/20">Clock</th>
              <th className="px-4 py-2 text-left font-mono text-xs text-bone/20 border-l border-white/5">Black</th>
              <th className="px-4 py-2 text-right font-mono text-xs text-bone/20">Loss</th>
              <th className="px-4 py-2 text-right font-mono text-xs text-bone/20">Clock</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map(({ white, black, pairIndex }) => {
              const whiteIdx = pairIndex * 2
              const blackIdx = pairIndex * 2 + 1
              const isWhiteSelected = selectedIndex === whiteIdx
              const isBlackSelected = selectedIndex === blackIdx

              return (
                <tr
                  key={pairIndex}
                  className="border-b border-white/3 hover:bg-white/2 transition-colors"
                  ref={isWhiteSelected || isBlackSelected ? selectedRef : null}
                >
                  <td className="px-4 py-2.5 font-mono text-xs text-bone/20">
                    {pairIndex + 1}
                  </td>

                  {/* White move */}
                  <td
                    className={clsx(
                      'px-4 py-2.5 cursor-pointer transition-colors',
                      isWhiteSelected ? 'bg-amber-chess/10' : ''
                    )}
                    onClick={() => onSelectMove(whiteIdx)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={clsx(
                          'font-mono text-sm',
                          white.is_blunder ? 'text-signal-blunder' :
                          white.is_mistake ? 'text-signal-mistake' :
                          white.is_inaccuracy ? 'text-signal-inaccuracy' :
                          isWhiteSelected ? 'text-amber-chess' : 'text-bone/80'
                        )}
                      >
                        {white.san}
                      </span>
                      <MoveClassBadge move={white} />
                    </div>
                  </td>
                  <td className={clsx('px-4 py-2.5 text-right font-mono text-xs', deltaColor(white.eval_delta))}>
                    {white.eval_delta !== null ? white.eval_delta.toFixed(0) : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-bone/20">
                    {formatClock(white.clock_remaining)}
                  </td>

                  {/* Black move */}
                  <td
                    className={clsx(
                      'px-4 py-2.5 border-l border-white/5 cursor-pointer transition-colors',
                      isBlackSelected ? 'bg-amber-chess/10' : '',
                      !black ? 'opacity-0 pointer-events-none' : ''
                    )}
                    onClick={() => black && onSelectMove(blackIdx)}
                  >
                    {black && (
                      <div className="flex items-center gap-1.5">
                        <span
                          className={clsx(
                            'font-mono text-sm',
                            black.is_blunder ? 'text-signal-blunder' :
                            black.is_mistake ? 'text-signal-mistake' :
                            black.is_inaccuracy ? 'text-signal-inaccuracy' :
                            isBlackSelected ? 'text-amber-chess' : 'text-bone/80'
                          )}
                        >
                          {black.san}
                        </span>
                        <MoveClassBadge move={black} />
                      </div>
                    )}
                  </td>
                  <td className={clsx('px-4 py-2.5 text-right font-mono text-xs', black ? deltaColor(black.eval_delta) : '')}>
                    {black?.eval_delta !== undefined && black?.eval_delta !== null
                      ? black.eval_delta.toFixed(0)
                      : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-bone/20">
                    {black ? formatClock(black.clock_remaining) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
