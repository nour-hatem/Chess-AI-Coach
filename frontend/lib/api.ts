import type {
  GameUploadResponse,
  GameStatusResponse,
  GameReport,
  Move,
} from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.detail ?? `Request failed: ${res.status}`)
  }

  return res.json() as Promise<T>
}

export const api = {
  uploadGame: (pgn: string) =>
    request<GameUploadResponse>('/api/v1/games/upload', {
      method: 'POST',
      body: JSON.stringify({ pgn }),
    }),

  getStatus: (gameId: string) =>
    request<GameStatusResponse>(`/api/v1/games/${gameId}/status`),

  getReport: (gameId: string) =>
    request<GameReport>(`/api/v1/games/${gameId}/report`),

  getMoves: (gameId: string) =>
    request<Move[]>(`/api/v1/games/${gameId}/moves`),
}
