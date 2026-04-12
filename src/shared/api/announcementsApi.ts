import type { AnnouncementRead, CommentRead, CommentWrite } from '../types/api'
import { requestJson } from './http'

export function getAnnouncements(token: string): Promise<AnnouncementRead[]> {
  return requestJson<AnnouncementRead[]>('/announcements/', {
    method: 'GET',
    token,
  })
}

export function getComments(announcementId: number): Promise<CommentRead[]> {
  return requestJson<CommentRead[]>(`/comments/${announcementId}`, {
    method: 'GET',
  })
}

export function createComment(token: string, body: CommentWrite): Promise<CommentRead> {
  return requestJson<CommentRead>('/comments/', {
    method: 'POST',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
