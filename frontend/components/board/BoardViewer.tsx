'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Chess } from 'chess.js'
import clsx from 'clsx'
import type { Move } from '@/types'

const Chessboard = dynamic(() => import('react-chessboard').then(m => m.Chessboard), {
  ssr: false,
  loading: () => (
    <div className="aspect-square w-full bg-ink-soft/50 rounded-lg animate-pulse flex items-center justify-center">
      <span className="text-bone/20 font-mono text-sm">Loading board...</span>
    </div>
  ),
})

interface BoardViewerProps {
  moves: Move[]
  selectedIndex: number
  onSelectMove: (index: number) => void
}

function buildPositionAt(moves: Move[], upToIndex: number): string {
  const chess = new Chess()
  for (let i = 0; i <= upToIndex && i < moves.length; i++) {
    try {
      chess.move(moves[i].san)
    } catch {
      break
    }
  }
  return chess.fen()
}

function classLabel(move: Move): { label: string; color: string } | null {
  if (move.is_blunder) return { label: 'Blunder', color: '#e05252' }
  if (move.is_mistake) return { label: 'Mistake', color: '#e09052' }
  if (move.is_inaccuracy) return { label: 'Inaccuracy', color: '#e0c852' }
  return null
}

export function BoardViewer({ moves, selectedIndex, onSelectMove }: BoardViewerProps) {
  const [fen, setFen] = useState('start')

  useEffect(() => {
    if (moves.length === 0) return
    const idx = Math.max(0, Math.min(selectedIndex, moves.length - 1))
    setFen(buildPositionAt(moves, idx))
  }, [moves, selectedIndex])

  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(idx, moves.length - 1))
      onSelectMove(clamped)
    },
    [moves.length, onSelectMove]
  )

  const currentMove = moves[selectedIndex] ?? null
  const badge = currentMove ? classLabel(currentMove) : null

  const evalBefore = currentMove?.eval_before
  const evalAfter = currentMove?.eval_after
  const delta = currentMove?.eval_delta

  // Arrow for best move
  const arrows: [string, string, string][] = []
  if (currentMove?.best_move_uci && currentMove.best_move_uci !== currentMove.uci) {
    const bm = currentMove.best_move_uci
    arrows.push([bm.slice(0, 2), bm.slice(2, 4), 'rgba(201,168,76,0.7)'])
  }

  // Highlight played move
  const squareStyles: Record<string, React.CSSProperties> = {}
  if (currentMove?.uci) {
    const from = currentMove.uci.slice(0, 2)
    const to = currentMove.uci.slice(2, 4)
    const highlight = currentMove.is_blunder ? 'rgba(224,82,82,0.35)' :
      currentMove.is_mistake ? 'rgba(224,144,82,0.35)' :
      currentMove.is_inaccuracy ? 'rgba(224,200,82,0.35)' :
      'rgba(201,168,76,0.25)'
    squareStyles[from] = { backgroundColor: highlight }
    squareStyles[to] = { backgroundColor: highlight }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Board */}
      <div>
        <div className="rounded-xl overflow-hidden border border-white/8">
          <Chessboard
            position={fen}
            arePiecesDraggable={false}
            customBoardStyle={{ borderRadius: '0' }}
            customDarkSquareStyle={{ backgroundColor: '#4a3728' }}
            customLightSquareStyle={{ backgroundColor: '#c9a97e' }}
            customSquareStyles={squareStyles}
            customArrows={arrows}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4 px-1">
          <div className="flex gap-2">
            <NavBtn onClick={() => goTo(0)} label="⟪" title="Start" />
            <NavBtn onClick={() => goTo(selectedIndex - 1)} label="←" title="Previous" disabled={selectedIndex <= 0} />
            <NavBtn onClick={() => goTo(selectedIndex + 1)} label="→" title="Next" disabled={selectedIndex >= moves.length - 1} />
            <NavBtn onClick={() => goTo(moves.length - 1)} label="⟫" title="End" />
          </div>
          <span className="font-mono text-xs text-bone/30">
            Move {Math.ceil((selectedIndex + 1) / 2)} · {currentMove?.color ?? '—'}
          </span>
        </div>
      </div>

      {/* Move info panel */}
      <div className="space-y-4">
        {/* Current move */}
        <div className="border border-white/8 rounded-xl p-5 bg-ink-soft/30">
          <div className="font-mono text-xs text-bone/30 uppercase tracking-widest mb-3">Current move</div>
          <div className="flex items-center gap-3 mb-4">
            <span className="font-display text-4xl text-bone">{currentMove?.san ?? '—'}</span>
            {badge && (
              <span
                className="font-mono text-xs px-2 py-1 rounded border"
                style={{ color: badge.color, borderColor: `${badge.color}40`, backgroundColor: `${badge.color}10` }}
              >
                {badge.label}
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatBox label="Eval before" value={evalBefore !== null && evalBefore !== undefined ? evalBefore.toFixed(1) : '—'} />
            <StatBox label="Eval after" value={evalAfter !== null && evalAfter !== undefined ? evalAfter.toFixed(1) : '—'} />
            <StatBox
              label="CP loss"
              value={delta !== null && delta !== undefined ? delta.toFixed(0) : '—'}
              color={
                delta === null || delta === undefined ? undefined :
                delta < 10 ? '#52b052' :
                delta < 50 ? '#c9a84c' :
                delta < 100 ? '#e0c852' :
                delta < 200 ? '#e09052' : '#e05252'
              }
            />
          </div>
        </div>

        {/* Phase badge */}
        {currentMove && (
          <div className="border border-white/8 rounded-xl p-5 bg-ink-soft/30">
            <div className="font-mono text-xs text-bone/30 uppercase tracking-widest mb-2">Phase</div>
            <div className="font-mono text-sm text-amber-chess capitalize">{currentMove.phase}</div>
          </div>
        )}

        {/* Best move hint */}
        {currentMove?.best_move_uci && currentMove.best_move_uci !== currentMove.uci && (
          <div className="border border-amber-chess/20 rounded-xl p-5 bg-amber-chess/5">
            <div className="font-mono text-xs text-amber-chess/60 uppercase tracking-widest mb-2">Best move</div>
            <div className="font-mono text-sm text-amber-chess">{currentMove.best_move_uci}</div>
            <div className="font-mono text-xs text-bone/30 mt-1">(shown as gold arrow on board)</div>
          </div>
        )}

        {/* Move list mini */}
        <div className="border border-white/8 rounded-xl p-4 bg-ink-soft/30 max-h-64 overflow-y-auto">
          <div className="font-mono text-xs text-bone/30 uppercase tracking-widest mb-3">Moves</div>
          <div className="flex flex-wrap gap-1.5">
            {moves.map((m, i) => (
              <button
                key={i}
                onClick={() => onSelectMove(i)}
                className={clsx(
                  'font-mono text-xs px-2 py-1 rounded transition-all',
                  i === selectedIndex
                    ? 'bg-amber-chess text-ink'
                    : m.is_blunder
                    ? 'bg-signal-blunder/10 text-signal-blunder hover:bg-signal-blunder/20'
                    : m.is_mistake
                    ? 'bg-signal-mistake/10 text-signal-mistake hover:bg-signal-mistake/20'
                    : m.is_inaccuracy
                    ? 'bg-signal-inaccuracy/10 text-signal-inaccuracy hover:bg-signal-inaccuracy/20'
                    : 'bg-white/5 text-bone/50 hover:bg-white/10'
                )}
              >
                {m.color === 'white' ? `${Math.ceil((i + 1) / 2)}.` : ''}{m.san}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function NavBtn({
  onClick,
  label,
  title,
  disabled,
}: {
  onClick: () => void
  label: string
  title: string
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={clsx(
        'w-9 h-9 rounded-lg border font-mono text-sm transition-all',
        disabled
          ? 'border-white/5 text-white/10 cursor-not-allowed'
          : 'border-white/10 text-bone/50 hover:border-amber-chess hover:text-amber-chess'
      )}
    >
      {label}
    </button>
  )
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="bg-ink rounded-lg p-3">
      <div className="font-mono text-xs text-bone/20 mb-1">{label}</div>
      <div className="font-display text-lg" style={{ color: color ?? undefined }}>
        {value}
      </div>
    </div>
  )
}
