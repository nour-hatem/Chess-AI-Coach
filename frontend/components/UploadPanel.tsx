'use client'

import { useState } from 'react'
import clsx from 'clsx'

interface UploadPanelProps {
  onSubmit: (pgn: string) => void
  isLoading: boolean
}

const EXAMPLE_PGN = `[Event "Example Game"]
[White "Magnus Carlsen"]
[Black "Hikaru Nakamura"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 1-0`

export function UploadPanel({ onSubmit, isLoading }: UploadPanelProps) {
  const [pgn, setPgn] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = pgn.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  const loadExample = () => setPgn(EXAMPLE_PGN)

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-chess/30 text-amber-chess text-xs font-mono mb-6 tracking-widest uppercase">
          Phase 1 · Core Analysis
        </div>
        <h1 className="font-display text-5xl md:text-6xl text-bone mb-4 leading-tight">
          Know your game.
          <br />
          <span className="text-amber-chess">Deeply.</span>
        </h1>
        <p className="text-bone/40 text-lg max-w-md mx-auto font-light">
          Paste a PGN and get blunder detection, accuracy scores, and phase-by-phase analysis powered by Stockfish.
        </p>
      </div>

      {/* Upload form */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-chess/50 to-transparent" />
            <textarea
              value={pgn}
              onChange={e => setPgn(e.target.value)}
              placeholder={'Paste your PGN here...\n\n[Event "My Game"]\n[White "Me"]\n[Black "Opponent"]\n\n1. e4 e5 2. Nf3 ...'}
              rows={12}
              className={clsx(
                'w-full bg-ink-soft border border-white/8 rounded-lg',
                'px-5 py-4 text-sm font-mono text-bone/80 placeholder:text-white/15',
                'focus:outline-none focus:border-amber-chess/50 focus:ring-1 focus:ring-amber-chess/20',
                'resize-none transition-all duration-200',
                'leading-relaxed tracking-wide'
              )}
            />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              type="button"
              onClick={loadExample}
              className="text-sm text-bone/30 hover:text-amber-chess transition-colors duration-200 font-mono"
            >
              load example game →
            </button>

            <button
              type="submit"
              disabled={!pgn.trim() || isLoading}
              className={clsx(
                'px-8 py-3 rounded-md font-mono text-sm tracking-wider uppercase transition-all duration-200',
                pgn.trim() && !isLoading
                  ? 'bg-amber-chess text-ink hover:bg-amber-light active:scale-95'
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              )}
            >
              {isLoading ? 'Uploading...' : 'Analyze Game'}
            </button>
          </div>
        </form>

        {/* Info grid */}
        <div className="grid grid-cols-3 gap-4 mt-16">
          {[
            { icon: '⚡', label: 'Stockfish Depth 18', desc: 'Engine evaluation per move' },
            { icon: '🎯', label: 'Blunder Detection', desc: 'Centipawn loss classification' },
            { icon: '📊', label: 'Phase Breakdown', desc: 'Opening, middlegame, endgame' },
          ].map(item => (
            <div
              key={item.label}
              className="border border-white/5 rounded-lg p-4 bg-ink-soft/50"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-xs font-mono text-amber-chess mb-1">{item.label}</div>
              <div className="text-xs text-bone/30">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
