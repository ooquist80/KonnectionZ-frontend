const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://192.168.0.5:8000'

export class ApiError extends Error {
  status: number
  payload: unknown

  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export function getApiErrorMessage(error: unknown): string | null {
  if (error && typeof error === 'object' && 'payload' in error) {
    const payload = (error as { payload: unknown }).payload

    if (payload && typeof payload === 'object' && 'detail' in payload) {
      const detail = (payload as { detail: unknown }).detail

      if (typeof detail === 'string') {
        return detail
      }

      if (Array.isArray(detail)) {
        return detail
          .map((item) => {
            if (item && typeof item === 'object' && 'msg' in item) {
              const message = (item as { msg: unknown }).msg
              return typeof message === 'string' ? message : null
            }

            return null
          })
          .filter((message): message is string => message !== null)
          .join(', ')
      }
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return null
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  token?: string | null
  body?: BodyInit | null
  headers?: Record<string, string>
}

export async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body,
  })

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new ApiError(`Request failed: ${response.status}`, response.status, payload)
  }

  return payload as T
}
