<template>
  <section class="announcements">
    <h2 class="announcements-title">Announcements</h2>

    <p v-if="isLoading" class="announcements-empty">Loading...</p>
    <p v-else-if="error" class="announcements-empty">{{ error }}</p>
    <p v-else-if="items.length === 0" class="announcements-empty">No announcements yet.</p>

    <ul v-else class="announcements-list">
      <li v-for="item in items" :key="item.id" class="announcement-item">
        <img
          v-if="item.avatarSrc"
          :src="item.avatarSrc"
          alt="User avatar"
          class="announcement-avatar"
        />
        <div v-else class="announcement-avatar announcement-avatar--placeholder" />

        <div class="announcement-body">
          <p class="announcement-content">{{ item.content }}</p>
          <time class="announcement-time" :datetime="item.announced_at">
            {{ formatDate(item.announced_at) }}
          </time>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getAnnouncements } from '../api/announcementsApi'
import { getUser } from '../api/authApi'
import { buildAvatarSvg } from '../utils/avatarUtils'
import { useAuthStore } from '../../auth/store/authStore'
import type { AnnouncementRead } from '../types/api'

interface AnnouncementItem extends AnnouncementRead {
  avatarSrc: string | null
}

const auth = useAuthStore()
const items = ref<AnnouncementItem[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  const token = auth.token.value
  if (!token) return

  isLoading.value = true
  error.value = null

  try {
    const announcements = await getAnnouncements(token)

    // Fetch avatars for all unique user_ids in parallel
    const userIds = [...new Set(announcements.map((a) => a.user_id).filter((id): id is number => id !== null))]
    const userMap = new Map<number, string>()

    await Promise.all(
      userIds.map(async (id) => {
        try {
          const user = await getUser(token, id)
          userMap.set(id, buildAvatarSvg(user.avatar))
        } catch {
          // silently skip if user fetch fails
        }
      }),
    )

    items.value = announcements.map((a) => ({
      ...a,
      avatarSrc: a.user_id !== null ? (userMap.get(a.user_id) ?? null) : null,
    }))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load announcements'
  } finally {
    isLoading.value = false
  }
})

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.announcements {
  gap: 0.75rem;
}

.announcements-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
}

.announcements-empty {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.announcements-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

.announcement-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.9rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.6rem;
  background: #fff;
}

.announcement-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.announcement-avatar--placeholder {
  background: #e5e7eb;
}

.announcement-body {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}

.announcement-content {
  margin: 0;
  font-size: 0.9rem;
  color: #1f2937;
  line-height: 1.5;
}

.announcement-time {
  font-size: 0.78rem;
  color: #9ca3af;
}
</style>
