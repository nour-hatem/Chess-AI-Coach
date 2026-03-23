'use client'

import { useState } from 'react'
import type { GameReport, Move } from '@/types'
import { AccuracyCard } from '@/components/report/AccuracyCard'
import { BlunderSummary } from '@/components/report/BlunderSummary'
import { PhaseBreakdown } from '@/components/report/PhaseBreakdown'
import { MovesTable } from '@/components/report/MovesTable'
import { BoardViewer } from '@/components/board/BoardViewer'

interface GameDashboardProps {
  report: GameReport
  moves: Move[]
  gameId: string
}

type Tab = 'overview' | 'moves' | 'board'

export function GameDashboard({ report, moves, gameId }: GameDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number>(moves.length - 1)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'moves', label: `Moves (${moves.length})` },
    { id: 'board', label: 'Board Viewer' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Game ID badge */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl text-bone mb-1">Analysis Complete</h2>
          <p className="font-mono text-xs text-bone/30">
            game · <span className="text-amber-chess">{gameId.slice(0, 8)}...</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-bone/30 text-xs font-mono uppercase tracking-widest mb-1">Accuracy</div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="font-display text-2xl text-bone">{report.accuracy_white.toFixed(1)}%</div>
              <div className="text-xs text-bone/30 font-mono">White</div>
            </div>
            <div className="text-bone/20">·</div>
            <div className="text-center">
              <div className="font-display text-2xl text-bone">{report.accuracy_black.toFixed(1)}%</div>
              <div className="text-xs text-bone/30 font-mono">Black</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-white/5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 font-mono text-sm transition-all duration-200 border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-amber-chess text-amber-chess'
                : 'border-transparent text-bone/30 hover:text-bone/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AccuracyCard report={report} />
          <BlunderSummary report={report} />
          <PhaseBreakdown report={report} />
        </div>
      )}

      {activeTab === 'moves' && (
        <MovesTable
          moves={moves}
          selectedIndex={selectedMoveIndex}
          onSelectMove={setSelectedMoveIndex}
        />
      )}

      {activeTab === 'board' && (
        <BoardViewer
          moves={moves}
          selectedIndex={selectedMoveIndex}
          onSelectMove={setSelectedMoveIndex}
        />
      )}
    </div>
  )
}
