'use client'

interface ErrorPanelProps {
  message: string
  onDismiss: () => void
}

export function ErrorPanel({ message, onDismiss }: ErrorPanelProps) {
  return (
    <div className="border border-signal-blunder/30 bg-signal-blunder/5 rounded-xl p-5 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="text-signal-blunder mt-0.5">✕</span>
        <div>
          <div className="font-mono text-sm text-signal-blunder mb-1">Analysis failed</div>
          <div className="font-mono text-xs text-bone/40">{message}</div>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="text-bone/20 hover:text-bone/60 font-mono text-xs transition-colors shrink-0"
      >
        Try again →
      </button>
    </div>
  )
}
