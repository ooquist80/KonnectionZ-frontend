<template>
  <section class="announcements">
    <h2 class="announcements-title">{{ $t('shared.announcements.title') }}</h2>

    <p v-if="isLoading" class="announcements-empty">{{ $t('shared.announcements.loading') }}</p>
    <p v-else-if="error" class="announcements-empty">{{ error }}</p>
    <p v-else-if="items.length === 0" class="announcements-empty">{{ $t('shared.announcements.noAnnouncements') }}</p>

    <ul v-else class="announcements-list">
      <li v-for="item in items" :key="item.id" class="announcement-item">
        <div class="announcement-top">
          <img
            v-if="item.avatarSrc"
            :src="item.avatarSrc"
            :alt="$t('shared.avatarMenu.avatarAlt')"
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
              {{ expandedId === item.id ? $t('shared.announcements.hideComments') : $t('shared.announcements.comments') }}
              <span v-if="item.comment_count" class="comment-count">({{ item.comment_count }})</span>
            </button>
          </div>
        </div>

        <!-- Comments section (full width, below avatar row) -->
        <div v-if="expandedId === item.id" class="comments-section">
          <p v-if="commentsLoading" class="comments-status">{{ $t('shared.announcements.loadingComments') }}</p>
          <p v-else-if="commentsError" class="comments-status comments-error">{{ commentsError }}</p>
          <template v-else>
            <p v-if="comments.length === 0" class="comments-status">{{ $t('shared.announcements.noComments') }}</p>
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
              :placeholder="$t('shared.announcements.commentPlaceholder')"
              class="comment-input"
              required
              :disabled="commentSubmitting"
            />
            <button type="submit" class="comment-submit" :disabled="commentSubmitting || !newComment.trim()">
              {{ commentSubmitting ? '...' : $t('common.send') }}
            </button>
          </form>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAnnouncements, getComments, createComment } from '../api/announcementsApi'
import { getUser } from '../api/authApi'
import { buildAvatarSvg } from '../utils/avatarUtils'
import { useAuthStore } from '../../auth/store/authStore'
import type { AnnouncementRead, CommentRead } from '../types/api'

const { t } = useI18n()

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
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('shared.announcements.loadCommentsFailed')
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
    const item = items.value.find(a => a.id === announcementId)
    if (item) {
      item.comment_count = comments.value.length
    }
  } catch (err) {
    commentsError.value = err instanceof Error ? err.message : t('shared.announcements.loadCommentsFailed')
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
    const item = items.value.find(a => a.id === announcementId)
    if (item) {
      item.comment_count++
    }
    newComment.value = ''
  } catch (err) {
    commentsError.value = err instanceof Error ? err.message : t('shared.announcements.postCommentFailed')
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
  color: var(--kz-text);
}

.announcements-empty {
  margin: 0;
  color: var(--kz-text-muted);
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
  display: grid;
  gap: 0;
  padding: 0.9rem 1rem;
  border: 1px solid var(--kz-border);
  border-radius: 0.6rem;
  background: var(--kz-surface);
  min-width: 0;
  overflow: hidden;
}

.announcement-top {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.announcement-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.announcement-avatar--placeholder {
  background: var(--kz-surface-hover);
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
  color: var(--kz-text);
  line-height: 1.5;
}

.announcement-time {
  font-size: 0.78rem;
  color: var(--kz-text-faint);
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
  color: var(--kz-text-muted);
  cursor: pointer;
}

.comments-toggle:hover {
  color: var(--kz-text);
}

/* ── Comments section ── */

.comments-section {
  display: grid;
  gap: 0.4rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--kz-border);
  min-width: 0;
  overflow: hidden;
}

.comments-status {
  margin: 0;
  font-size: 0.82rem;
  color: var(--kz-text-faint);
}

.comments-error {
  color: #dc2626;
}

.comments-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.3rem;
  max-height: 12rem;
  overflow-y: auto;
}

.comment-item {
  display: grid;
  gap: 0.05rem;
}

.comment-user {
  font-size: 0.75rem;
  color: var(--kz-text);
}

.comment-content {
  margin: 0;
  font-size: 0.8rem;
  color: var(--kz-text);
  line-height: 1.35;
  word-break: break-word;
  overflow-wrap: break-word;
}

.comment-time {
  font-size: 0.68rem;
  color: var(--kz-text-faint);
}

/* ── Comment form ── */

.comment-form {
  display: flex;
  gap: 0.3rem;
  margin-top: 0.15rem;
  min-width: 0;
}

.comment-input {
  flex: 1;
  font: inherit;
  font-size: 0.8rem;
  padding: 0.35rem 0.7rem;
  border: 1px solid var(--kz-border);
  border-radius: 2rem;
  min-width: 0;
  background: var(--kz-input-bg);
  color: var(--kz-text);
}

.comment-submit {
  font-size: 0.75rem;
  padding: 0.35rem 0.7rem;
  flex-shrink: 0;
}
</style>
