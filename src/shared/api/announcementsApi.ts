import type { AnnouncementRead } from '../types/api'
import { requestJson } from './http'

export function getAnnouncements(token: string): Promise<AnnouncementRead[]> {
  return requestJson<AnnouncementRead[]>('/announcements/', {
    method: 'GET',
    token,
  })
}
