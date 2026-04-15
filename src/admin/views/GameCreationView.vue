<template>
  <section class="game-creation-view">
    <div class="header">
      <button type="button" class="back-btn" @click="router.push({ name: 'home' })">{{ $t('common.back') }}</button>
      <div>
        <h1>{{ $t('gameCreator.title') }}</h1>
        <p class="subtitle">{{ $t('gameCreator.subtitle') }}</p>
      </div>
    </div>

    <ApiErrorBanner :message="errorMessage" />
    <div v-if="successMessage" class="success-banner">{{ successMessage }}</div>

    <form class="creator-form" @submit.prevent="onSubmit">
      <section class="panel">
        <div class="panel-heading">
          <h2>{{ $t('gameCreator.detailsTitle') }}</h2>
          <span class="draft-pill">{{ $t('gameCreator.localDraft') }}</span>
        </div>

        <label for="game-name">{{ $t('admin.gamesets.name') }}</label>
        <input id="game-name" v-model="gameForm.name" required placeholder="e.g. Daily 2026-04-03" />

        <label for="game-daily-date">
          {{ $t('admin.gamesets.dailyDate') }}
          <span class="muted">{{ $t('admin.gamesets.dailyDateOptional') }}</span>
        </label>
        <input id="game-daily-date" v-model="gameForm.dailyDate" type="date" />

        <p class="muted">{{ $t('gameCreator.saveHint') }}</p>
      </section>

      <div class="wordsets-grid">
        <section v-for="(draft, index) in wordsetDrafts" :key="index" class="panel wordset-panel">
          <div class="panel-heading">
            <h2>{{ $t('gameCreator.wordsetTitle', { index: index + 1 }) }}</h2>
            <span class="status-pill" :class="{ 'status-pill--ready': isWordsetComplete(index) }">
              {{ isWordsetComplete(index) ? $t('gameCreator.ready') : $t('gameCreator.incomplete') }}
            </span>
          </div>

          <label :for="`wordset-category-${index}`">{{ $t('admin.wordsets.category') }}</label>
          <input
            :id="`wordset-category-${index}`"
            v-model="draft.category"
            required
            :placeholder="$t('gameCreator.categoryPlaceholder')"
          />

          <label :for="`wordset-difficulty-${index}`">{{ $t('admin.wordsets.difficulty') }}</label>
          <input
            :id="`wordset-difficulty-${index}`"
            v-model.number="draft.difficulty"
            type="number"
            min="1"
            max="4"
            required
          />

          <label :for="`wordset-words-${index}`">{{ $t('admin.wordsets.words') }}</label>
          <textarea
            :id="`wordset-words-${index}`"
            v-model="draft.wordsRaw"
            rows="3"
            required
            :placeholder="$t('gameCreator.wordsPlaceholder')"
          />

          <div class="wordset-meta">
            <span class="muted">{{ $t('gameCreator.wordCount', { count: wordCounts[index] }) }}</span>
            <span v-if="wordCounts[index] < 4" class="muted">{{ $t('admin.wordsets.minWords') }}</span>
          </div>
        </section>
      </div>

      <section class="panel review-panel">
        <div class="panel-heading">
          <h2>{{ $t('gameCreator.reviewTitle') }}</h2>
          <span class="draft-pill">{{ $t('gameCreator.selectedCount', { count: completedWordsetCount }) }}</span>
        </div>

        <p class="muted">{{ $t('gameCreator.reviewHelp') }}</p>

        <div class="review-list">
          <div v-for="(draft, index) in wordsetDrafts" :key="`review-${index}`" class="review-item">
            <strong>{{ $t('gameCreator.wordsetTitle', { index: index + 1 }) }}</strong>
            <template v-if="draft.category.trim()">
              <span>{{ draft.category.trim() }}</span>
              <span v-if="parseWordsInput(draft.wordsRaw).length" class="review-words">
                {{ parseWordsInput(draft.wordsRaw).join(', ') }}
              </span>
              <span v-else class="muted">{{ $t('gameCreator.reviewEmpty') }}</span>
            </template>
            <span v-else class="muted">{{ $t('gameCreator.reviewEmpty') }}</span>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="isSaving || !isDraftComplete">
            {{ isSaving ? $t('gameCreator.saving') : $t('gameCreator.saveGame') }}
          </button>
        </div>
      </section>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ApiErrorBanner from '../../shared/ui/ApiErrorBanner.vue'
import { createGameset, createWordset, deleteWordset } from '../../shared/api/adminApi'
import { useAuthStore } from '../../auth/store/authStore'
import { parseWordsInput } from '../utils/wordsetForm'
import { hasGamemasterScope } from '../../shared/auth/permissions'

interface WordsetDraft {
  category: string
  difficulty: number
  wordsRaw: string
}

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const gameForm = reactive({
  name: '',
  dailyDate: '',
})

const wordsetDrafts = reactive<WordsetDraft[]>(createDraftWordsets())

const isSaving = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const isGamemaster = computed(() => hasGamemasterScope(auth.user.value?.scopes ?? []))
const wordCounts = computed(() => wordsetDrafts.map((draft) => parseWordsInput(draft.wordsRaw).length))
const completedWordsetCount = computed(() => wordsetDrafts.filter((_, index) => isWordsetComplete(index)).length)
const isDraftComplete = computed(() =>
  gameForm.name.trim().length > 0 && wordsetDrafts.every((_, index) => isWordsetComplete(index)),
)

watch(() => auth.user.value, (user) => {
  if (user && !isGamemaster.value) {
    void router.replace({ name: 'home' })
  }
}, { immediate: true })

function createEmptyWordsetDraft(): WordsetDraft {
  return {
    category: '',
    difficulty: 1,
    wordsRaw: '',
  }
}

function createDraftWordsets(): WordsetDraft[] {
  return Array.from({ length: 4 }, () => createEmptyWordsetDraft())
}

function token(): string {
  return auth.token.value!
}

function isWordsetComplete(index: number): boolean {
  const draft = wordsetDrafts[index]
  if (!draft) {
    return false
  }

  return draft.category.trim().length > 0
    && draft.difficulty >= 1
    && draft.difficulty <= 4
    && parseWordsInput(draft.wordsRaw).length >= 4
}

function resetDraft() {
  gameForm.name = ''
  gameForm.dailyDate = ''

  wordsetDrafts.forEach((_, index) => {
    wordsetDrafts[index] = createEmptyWordsetDraft()
  })
}

async function rollbackWordsets(createdWordsetIds: number[]) {
  await Promise.allSettled(createdWordsetIds.map((wordsetId) => deleteWordset(token(), wordsetId)))
}

async function onSubmit() {
  if (!isDraftComplete.value) {
    return
  }

  const categories = wordsetDrafts.map((draft) => draft.category.trim()).join(', ')
  const confirmed = window.confirm(
    t('gameCreator.confirmSave', {
      name: gameForm.name.trim(),
      categories,
    }),
  )

  if (!confirmed) {
    return
  }

  isSaving.value = true
  errorMessage.value = null
  successMessage.value = null

  const createdWordsetIds: number[] = []

  try {
    for (const draft of wordsetDrafts) {
      const createdWordset = await createWordset(token(), {
        category: draft.category.trim(),
        difficulty: draft.difficulty,
        words: parseWordsInput(draft.wordsRaw),
      })

      createdWordsetIds.push(createdWordset.id)
    }

    await createGameset(token(), {
      name: gameForm.name.trim(),
      daily_date: gameForm.dailyDate ? new Date(gameForm.dailyDate).toISOString() : null,
      wordsets: createdWordsetIds,
    })

    successMessage.value = t('gameCreator.saveSuccess')
    resetDraft()
  } catch (error) {
    await rollbackWordsets(createdWordsetIds)
    errorMessage.value = error instanceof Error ? error.message : t('gameCreator.saveFailed')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.game-creation-view {
  gap: 1rem;
}

.header {
  display: flex;
  align-items: start;
  gap: 1rem;
}

.header h1 {
  margin: 0;
}

.subtitle {
  margin: 0.35rem 0 0;
  color: var(--kz-text-muted);
}

.back-btn {
  background: var(--kz-btn-bg);
  border: 1px solid var(--kz-border);
  border-radius: 2rem;
  padding: 0.35rem 0.9rem;
  font-size: 0.875rem;
  cursor: pointer;
  color: var(--kz-btn-text);
  transition: border-color 0.15s;
}

.back-btn:hover {
  border-color: var(--kz-text-muted);
}

.success-banner {
  border: 1px solid #86efac;
  background: #f0fdf4;
  color: #166534;
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
}

.creator-form {
  display: grid;
  gap: 1rem;
}

.panel {
  display: grid;
  gap: 0.75rem;
  border: 1px solid var(--kz-border);
  border-radius: 0.75rem;
  padding: 1rem;
  background: var(--kz-surface);
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: start;
  flex-wrap: wrap;
}

.panel-heading h2 {
  margin: 0;
}

.draft-pill,
.status-pill {
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  border: 1px solid var(--kz-border);
  background: var(--kz-glass-strong);
  font-size: 0.78rem;
  font-weight: 600;
}

.status-pill--ready {
  border-color: #86efac;
  background: #f0fdf4;
  color: #166534;
}

.panel input,
.panel textarea {
  font: inherit;
  padding: 0.65rem 0.9rem;
  border: 1px solid var(--kz-border);
  border-radius: 1rem;
  background: var(--kz-input-bg);
  color: var(--kz-text);
  width: 100%;
  min-width: 0;
}

.panel textarea {
  min-height: 6rem;
  resize: vertical;
}

.muted {
  margin: 0;
  color: var(--kz-text-muted);
}

.wordsets-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.wordset-panel {
  align-content: start;
}

.wordset-meta {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.review-panel {
  gap: 1rem;
}

.review-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.review-item {
  display: grid;
  gap: 0.35rem;
  padding: 0.75rem;
  border-radius: 0.65rem;
  background: var(--kz-glass-strong);
  overflow-wrap: anywhere;
}

.review-words {
  color: var(--kz-text-muted);
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
}

@media (max-width: 900px) {
  .wordsets-grid,
  .review-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .back-btn,
  .form-actions button {
    width: 100%;
  }

  .wordsets-grid,
  .review-list {
    grid-template-columns: 1fr;
  }
}
</style>
