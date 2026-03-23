'use client'

import { useGameAnalysis } from '@/hooks/useGameAnalysis'
import { UploadPanel } from '@/components/UploadPanel'
import { ProcessingScreen } from '@/components/ProcessingScreen'
import { GameDashboard } from '@/components/GameDashboard'
import { ErrorPanel } from '@/components/ui/ErrorPanel'

export default function Home() {
  const {
    gameId,
    status,
    report,
    moves,
    error,
    isUploading,
    isPolling,
    uploadGame,
    reset,
  } = useGameAnalysis()

  const isProcessing = isUploading || isPolling
  const isDone = status === 'done' && report !== null

  return (
    <main className="min-h-screen bg-ink">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-amber-chess text-2xl">♟</span>
            <span className="font-display text-xl text-bone tracking-wide">
              Chess Coach <span className="text-amber-chess">AI</span>
            </span>
          </div>

          {isDone && (
            <button
              onClick={reset}
              className="text-sm text-bone/50 hover:text-amber-chess transition-colors duration-200 flex items-center gap-2"
            >
              <span>←</span> Analyze another game
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6">
            <ErrorPanel message={error} onDismiss={reset} />
          </div>
        )}

        {!isProcessing && !isDone && !error && (
          <UploadPanel onSubmit={uploadGame} isLoading={isUploading} />
        )}

        {isProcessing && <ProcessingScreen status={status} />}

        {isDone && (
          <GameDashboard
            report={report!}
            moves={moves}
            gameId={gameId!}
          />
        )}
      </div>
    </main>
  )
}
