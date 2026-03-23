'use client'

import type { GameStatus } from '@/types'

interface ProcessingScreenProps {
  status: GameStatus | null
}

const STATUS_MESSAGES: Record<string, string> = {
  pending: 'Queued for analysis...',
  processing: 'Stockfish is evaluating your game...',
}

export function ProcessingScreen({ status }: ProcessingScreenProps) {
  const message = status ? (STATUS_MESSAGES[status] ?? 'Processing...') : 'Uploading...'

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      {/* Spinner */}
      <div className="relative w-24 h-24 mb-10">
        <div className="absolute inset-0 rounded-full border border-white/5" />
        <div className="absolute inset-0 rounded-full border-t border-amber-chess animate-spin" />
        <div className="absolute inset-3 rounded-full border border-white/5" />
        <div
          className="absolute inset-3 rounded-full border-t border-amber-chess/50 animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          ♟
        </div>
      </div>

      <h2 className="font-display text-3xl text-bone mb-3">Analyzing...</h2>
      <p className="text-bone/40 font-mono text-sm mb-8">{message}</p>

      {/* Progress steps */}
      <div className="flex flex-col gap-3 text-left w-64">
        {[
          { label: 'Parse PGN', done: true },
          { label: 'Evaluate positions', done: status === 'processing' || status === 'done' },
          { label: 'Extract features', done: status === 'done' },
          { label: 'Generate report', done: status === 'done' },
        ].map((step, i) => (
          <div key={step.label} className="flex items-center gap-3">
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs transition-all duration-500 ${
                step.done
                  ? 'border-amber-chess bg-amber-chess text-ink'
                  : 'border-white/15 text-white/15'
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              {step.done ? '✓' : '○'}
            </div>
            <span
              className={`font-mono text-sm transition-colors duration-500 ${
                step.done ? 'text-bone/70' : 'text-white/20'
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <p className="text-bone/20 font-mono text-xs mt-10">
        Deep analysis takes 30–120 seconds depending on game length
      </p>
    </div>
  )
}
