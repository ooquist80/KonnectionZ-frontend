import { requestJson } from './http'
import type { PlayGameSet, PlayResult } from '../types/api'

export function createDailyGame(token: string): Promise<PlayResult> {
  return requestJson<PlayResult>('/play/', {
    method: 'POST',
    token,
  })
}

export function listGamesets(token: string): Promise<PlayGameSet[]> {
  return requestJson<PlayGameSet[]>('/play/gamesets', {
    method: 'GET',
    token,
  })
}

export function createGame(token: string, gamesetId: number): Promise<PlayResult> {
  return requestJson<PlayResult>(`/play/${gamesetId}`, {
    method: 'POST',
    token,
  })
}

export function playWords(token: string, gameId: number, words: string[]): Promise<PlayResult> {
  return requestJson<PlayResult>(`/play/${gameId}`, {
    method: 'PUT',
    token,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(words),
  })
}
