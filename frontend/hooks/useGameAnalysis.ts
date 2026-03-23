'use client'

import { useState, useCallback, useRef } from 'react'
import { api } from '@/lib/api'
import type { GameReport, Move, GameStatus } from '@/types'

interface AnalysisState {
  gameId: string | null
  status: GameStatus | null
  report: GameReport | null
  moves: Move[]
  error: string | null
  isUploading: boolean
  isPolling: boolean
}

const POLL_INTERVAL_MS = 2000
const MAX_POLL_ATTEMPTS = 150

export function useGameAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    gameId: null,
    status: null,
    report: null,
    moves: [],
    error: null,
    isUploading: false,
    isPolling: false,
  })

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const attemptsRef = useRef(0)

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    attemptsRef.current = 0
  }, [])

  const fetchResults = useCallback(async (gameId: string) => {
    const [report, moves] = await Promise.all([
      api.getReport(gameId),
      api.getMoves(gameId),
    ])
    setState(prev => ({
      ...prev,
      report,
      moves,
      isPolling: false,
      status: 'done',
    }))
  }, [])

  const startPolling = useCallback(
    (gameId: string) => {
      setState(prev => ({ ...prev, isPolling: true }))
      attemptsRef.current = 0

      pollRef.current = setInterval(async () => {
        attemptsRef.current += 1

        if (attemptsRef.current > MAX_POLL_ATTEMPTS) {
          stopPolling()
          setState(prev => ({
            ...prev,
            isPolling: false,
            error: 'Analysis timed out. Please try again.',
          }))
          return
        }

        try {
          const status = await api.getStatus(gameId)

          setState(prev => ({ ...prev, status: status.status }))

          if (status.status === 'done') {
            stopPolling()
            await fetchResults(gameId)
          } else if (status.status === 'failed') {
            stopPolling()
            setState(prev => ({
              ...prev,
              isPolling: false,
              error: status.error_message ?? 'Analysis failed.',
            }))
          }
        } catch (err) {
          stopPolling()
          setState(prev => ({
            ...prev,
            isPolling: false,
            error: err instanceof Error ? err.message : 'Polling error.',
          }))
        }
      }, POLL_INTERVAL_MS)
    },
    [stopPolling, fetchResults]
  )

  const uploadGame = useCallback(
    async (pgn: string) => {
      setState({
        gameId: null,
        status: null,
        report: null,
        moves: [],
        error: null,
        isUploading: true,
        isPolling: false,
      })
      stopPolling()

      try {
        const res = await api.uploadGame(pgn)
        setState(prev => ({
          ...prev,
          gameId: res.game_id,
          status: res.status,
          isUploading: false,
        }))
        startPolling(res.game_id)
      } catch (err) {
        setState(prev => ({
          ...prev,
          isUploading: false,
          error: err instanceof Error ? err.message : 'Upload failed.',
        }))
      }
    },
    [stopPolling, startPolling]
  )

  const reset = useCallback(() => {
    stopPolling()
    setState({
      gameId: null,
      status: null,
      report: null,
      moves: [],
      error: null,
      isUploading: false,
      isPolling: false,
    })
  }, [stopPolling])

  return { ...state, uploadGame, reset }
}
