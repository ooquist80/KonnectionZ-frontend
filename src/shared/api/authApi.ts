import type { UserRead, UserWrite } from '../types/api'
import { requestJson } from './http'

interface LoginPayload {
  username: string
  password: string
}

interface LoginTokenResponse {
  access_token?: string
  token?: string
  token_type?: string
  [key: string]: unknown
}

function extractAccessToken(payload: unknown): string {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Login response payload is not an object')
  }

  const tokenPayload = payload as LoginTokenResponse
  const candidate = tokenPayload.access_token ?? tokenPayload.token

  if (typeof candidate !== 'string' || candidate.length === 0) {
    throw new Error('Login response does not contain a usable access token')
  }

  return candidate
}

export async function login(credentials: LoginPayload): Promise<string> {
  const form = new URLSearchParams()
  form.set('username', credentials.username)
  form.set('password', credentials.password)
  form.set('scope', 'user:play user:admin')

  const response = await requestJson<unknown>('/auth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  })

  return extractAccessToken(response)
}

export function getMe(token: string): Promise<UserRead> {
  return requestJson<UserRead>('/users/me', {
    method: 'GET',
    token,
  })
}

export function updateAvatar(token: string, avatar: string): Promise<void> {
  return requestJson<void>(`/users/me/avatar?avatar=${encodeURIComponent(avatar)}`, {
    method: 'PUT',
    token,
  })
}

export function updateMe(
  token: string,
  body: UserWrite,
  changePassword: boolean,
): Promise<void> {
  return requestJson<void>(`/users/me?change_password=${changePassword}`, {
    method: 'PUT',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
