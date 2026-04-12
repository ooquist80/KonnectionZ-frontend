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

          <button
            type="button"
            class="comments-toggle"
            @click="toggleComments(item.id)"
          >
            {{ expandedId === item.id ? 'Hide comments' : 'Comments' }}
            <span v-if="commentCounts.get(item.id)" class="comment-count">({{ commentCounts.get(item.id) }})</span>
          </button>

          <!-- Comments section -->
          <div v-if="expandedId === item.id" class="comments-section">
            <p v-if="commentsLoading" class="comments-status">Loading comments...</p>
            <p v-else-if="commentsError" class="comments-status comments-error">{{ commentsError }}</p>
            <template v-else>
              <p v-if="comments.length === 0" class="comments-status">No comments yet.</p>
              <ul v-else class="comments-list">
                <li v-for="c in comments" :key="c.id" class="comment-item">
                  <strong class="comment-user">{{ c.user_name }}</strong>
                  <p class="comment-content">{{ c.content }}</p>
                  <time class="comment-time" :datetime="c.commented_at">{{ formatDate(c.commented_at) }}</time>
                </li>
              </ul>
            </template>

            <form v-if="auth.isAuthenticated.value" class="comment-form" @submit.prevent="submitComment(item.id)">
              <input
                v-model="newComment"
                type="text"
                placeholder="Write a comment..."
                class="comment-input"
                required
                :disabled="commentSubmitting"
              />
              <button type="submit" class="comment-submit" :disabled="commentSubmitting || !newComment.trim()">
                {{ commentSubmitting ? '...' : 'Send' }}
              </button>
            </form>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { getAnnouncements, getComments, createComment } from '../api/announcementsApi'
import { getUser } from '../api/authApi'
import { buildAvatarSvg } from '../utils/avatarUtils'
import { useAuthStore } from '../../auth/store/authStore'
import type { AnnouncementRead, CommentRead } from '../types/api'

interface AnnouncementItem extends AnnouncementRead {
  avatarSrc: string | null
}

const auth = useAuthStore()
const items = ref<AnnouncementItem[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const expandedId = ref<number | null>(null)
const comments = ref<CommentRead[]>([])
const commentsLoading = ref(false)
const commentsError = ref<string | null>(null)
const newComment = ref('')
const commentSubmitting = ref(false)
const commentCounts = reactive(new Map<number, number>())

onMounted(async () => {
  const token = auth.token.value
  if (!token) return

  isLoading.value = true
  error.value = null

  try {
    const announcements = await getAnnouncements(token)

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

    // Fetch comment counts in parallel
    await Promise.all(
      announcements.map(async (a) => {
        try {
          const c = await getComments(a.id)
          commentCounts.set(a.id, c.length)
        } catch {
          // silently skip
        }
      }),
    )
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load announcements'
  } finally {
    isLoading.value = false
  }
})

async function toggleComments(announcementId: number) {
  if (expandedId.value === announcementId) {
    expandedId.value = null
    return
  }

  expandedId.value = announcementId
  commentsLoading.value = true
  commentsError.value = null
  comments.value = []
  newComment.value = ''

  try {
    comments.value = await getComments(announcementId)
    commentCounts.set(announcementId, comments.value.length)
  } catch (err) {
    commentsError.value = err instanceof Error ? err.message : 'Failed to load comments'
  } finally {
    commentsLoading.value = false
  }
}

async function submitComment(announcementId: number) {
  const token = auth.token.value
  if (!token || !newComment.value.trim()) return

  commentSubmitting.value = true
  try {
    const created = await createComment(token, {
      announcement_id: announcementId,
      content: newComment.value.trim(),
    })
    comments.value.push(created)
    commentCounts.set(announcementId, comments.value.length)
    newComment.value = ''
  } catch (err) {
    commentsError.value = err instanceof Error ? err.message : 'Failed to post comment'
  } finally {
    commentSubmitting.value = false
  }
}

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
  flex: 1;
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

/* ── Comments toggle ── */

.comments-toggle {
  justify-self: start;
  margin-top: 0.25rem;
  background: none;
  border: none;
  padding: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
}

.comments-toggle:hover {
  color: #374151;
}

/* ── Comments section ── */

.comments-section {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.35rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f3f4f6;
}

.comments-status {
  margin: 0;
  font-size: 0.82rem;
  color: #9ca3af;
}

.comments-error {
  color: #dc2626;
}

.comments-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.4rem;
}

.comment-item {
  display: grid;
  gap: 0.1rem;
}

.comment-user {
  font-size: 0.8rem;
  color: #374151;
}

.comment-content {
  margin: 0;
  font-size: 0.85rem;
  color: #1f2937;
  line-height: 1.4;
}

.comment-time {
  font-size: 0.72rem;
  color: #9ca3af;
}

/* ── Comment form ── */

.comment-form {
  display: flex;
  gap: 0.35rem;
  margin-top: 0.25rem;
}

.comment-input {
  flex: 1;
  font: inherit;
  font-size: 0.85rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 2rem;
  min-width: 0;
}

.comment-submit {
  font-size: 0.8rem;
  padding: 0.4rem 0.9rem;
}
</style>
