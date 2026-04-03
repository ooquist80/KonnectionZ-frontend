import { requestJson } from './http'
import type { GameSetRead, GameSetWrite, UserRead, UserWrite, WordsetRead, WordsetWrite } from '../types/api'

// ── Gamesets ──

export function listGamesets(token: string): Promise<GameSetRead[]> {
  return requestJson<GameSetRead[]>('/gamesets/', { method: 'GET', token })
}

export function getGameset(token: string, gamesetId: number): Promise<GameSetRead> {
  return requestJson<GameSetRead>(`/gamesets/${gamesetId}`, { method: 'GET', token })
}

export function createGameset(token: string, payload: GameSetWrite): Promise<GameSetRead> {
  return requestJson<GameSetRead>('/gamesets/', {
    method: 'POST',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

// ── Wordsets ──

export function listWordsets(token: string): Promise<WordsetRead[]> {
  return requestJson<WordsetRead[]>('/wordsets', { method: 'GET', token })
}

export function createWordset(token: string, payload: WordsetWrite): Promise<WordsetRead> {
  return requestJson<WordsetRead>('/wordsets', {
    method: 'POST',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function updateWordset(token: string, wordsetId: number, payload: WordsetWrite): Promise<WordsetRead> {
  return requestJson<WordsetRead>(`/wordsets/${wordsetId}`, {
    method: 'PUT',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function deleteWordset(token: string, wordsetId: number): Promise<void> {
  return requestJson<void>(`/wordsets/${wordsetId}`, { method: 'DELETE', token })
}

// ── Users ──

export function createUser(token: string, payload: UserWrite): Promise<UserRead> {
  return requestJson<UserRead>('/users', {
    method: 'POST',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function getUser(token: string, userId: number): Promise<UserRead> {
  return requestJson<UserRead>(`/users/${userId}`, { method: 'GET', token })
}

export function listUsers(token: string): Promise<UserRead[]> {
  return requestJson<UserRead[]>('/users/', { method: 'GET', token })
}

export function deleteUser(token: string, userId: number): Promise<void> {
  return requestJson<void>(`/users/${userId}`, { method: 'DELETE', token })
}
