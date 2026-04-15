<template>
  <div class="manager">
    <ApiErrorBanner :message="errorMessage" />

    <!-- Create wordset form -->
    <details class="create-section">
      <summary>{{ $t('admin.wordsets.createTitle') }}</summary>
      <form class="create-form" @submit.prevent="onCreateWordset">
        <label for="ws-category">{{ $t('admin.wordsets.category') }}</label>
        <input id="ws-category" v-model="form.category" required placeholder="e.g. Fruits" />

        <label for="ws-difficulty">{{ $t('admin.wordsets.difficulty') }}</label>
        <input id="ws-difficulty" v-model.number="form.difficulty" type="number" min="1" max="4" required />

        <label for="ws-words">{{ $t('admin.wordsets.words') }}</label>
        <input id="ws-words" v-model="form.wordsRaw" required placeholder="apple, banana, cherry, date" />

        <button type="submit" :disabled="isLoading">{{ isLoading ? $t('admin.wordsets.creating') : $t('admin.wordsets.createWordset') }}</button>
      </form>
    </details>

    <!-- Existing wordsets -->
    <h3>{{ $t('admin.wordsets.existingTitle') }}</h3>
    <p v-if="isLoading && !wordsets.length" class="muted">{{ $t('admin.wordsets.loadingWordsets') }}</p>
    <p v-else-if="!wordsets.length" class="muted">{{ $t('admin.wordsets.noWordsets') }}</p>

    <div v-else class="wordset-list">
      <div v-for="ws in wordsets" :key="ws.id" class="wordset-card">
        <div class="wordset-header">
          <strong>{{ ws.category }}</strong>
          <span class="muted">{{ $t('admin.wordsets.difficulty') }} {{ ws.difficulty }} · ID #{{ ws.id }}</span>
        </div>
        <p class="word-list">{{ ws.words.map((w) => w.word).join(', ') }}</p>
        <div class="card-actions">
          <button type="button" @click="beginEdit(ws)">{{ $t('common.edit') }}</button>
          <button type="button" class="btn-danger" :disabled="isLoading" @click="onDelete(ws.id)">{{ $t('common.delete') }}</button>
        </div>

        <!-- Inline edit -->
        <form v-if="editingId === ws.id" class="edit-form" @submit.prevent="onSaveEdit">
          <label>{{ $t('admin.wordsets.category') }}</label>
          <input v-model="editForm.category" required />
          <label>{{ $t('admin.wordsets.difficulty') }}</label>
          <input v-model.number="editForm.difficulty" type="number" min="1" max="4" required />
          <label>{{ $t('admin.wordsets.wordsEdit') }}</label>
          <input v-model="editForm.wordsRaw" required />
          <div class="card-actions">
            <button type="submit" :disabled="isLoading">{{ $t('common.save') }}</button>
            <button type="button" @click="editingId = null">{{ $t('common.cancel') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { WordsetRead } from '../../shared/types/api'
import { listWordsets, createWordset, updateWordset, deleteWordset } from '../../shared/api/adminApi'
import { useAuthStore } from '../../auth/store/authStore'
import ApiErrorBanner from '../../shared/ui/ApiErrorBanner.vue'
import { parseWordsInput } from '../utils/wordsetForm'

const { t } = useI18n()
const auth = useAuthStore()
const wordsets = ref<WordsetRead[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const form = reactive({ category: '', difficulty: 1, wordsRaw: '' })

const editingId = ref<number | null>(null)
const editForm = reactive({ category: '', difficulty: 1, wordsRaw: '' })

function token(): string {
  return auth.token.value!
}

async function loadWordsets() {
  isLoading.value = true
  errorMessage.value = null
  try {
    wordsets.value = await listWordsets(token())
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : t('admin.wordsets.loadFailed')
  } finally {
    isLoading.value = false
  }
}

async function onCreateWordset() {
  const words = parseWordsInput(form.wordsRaw)
  if (words.length < 4) { errorMessage.value = t('admin.wordsets.minWords'); return }

  isLoading.value = true
  errorMessage.value = null
  try {
    await createWordset(token(), { category: form.category, difficulty: form.difficulty, words })
    form.category = ''
    form.difficulty = 1
    form.wordsRaw = ''
    await loadWordsets()
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : t('admin.wordsets.createFailed')
  } finally {
    isLoading.value = false
  }
}

function beginEdit(ws: WordsetRead) {
  editingId.value = ws.id
  editForm.category = ws.category
  editForm.difficulty = ws.difficulty
  editForm.wordsRaw = ws.words.map((w) => w.word).join(', ')
}

async function onSaveEdit() {
  if (editingId.value === null) return
  const words = parseWordsInput(editForm.wordsRaw)
  if (words.length < 4) { errorMessage.value = t('admin.wordsets.minWords'); return }

  isLoading.value = true
  errorMessage.value = null
  try {
    await updateWordset(token(), editingId.value, { category: editForm.category, difficulty: editForm.difficulty, words })
    editingId.value = null
    await loadWordsets()
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : t('admin.wordsets.updateFailed')
  } finally {
    isLoading.value = false
  }
}

async function onDelete(id: number) {
  isLoading.value = true
  errorMessage.value = null
  try {
    await deleteWordset(token(), id)
    await loadWordsets()
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : t('admin.wordsets.deleteFailed')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadWordsets)
</script>

<style scoped>
.manager {
  display: grid;
  gap: 1rem;
}

.muted {
  margin: 0;
  color: var(--kz-text-muted);
}

.create-section {
  border: 1px solid var(--kz-border);
  border-radius: 0.75rem;
  padding: 1rem;
}

summary {
  cursor: pointer;
  font-weight: 600;
}

.create-form,
.edit-form {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.75rem;
  max-width: 30rem;
}

.create-form input,
.edit-form input {
  font: inherit;
  padding: 0.5rem 1rem;
  border: 1px solid var(--kz-border);
  border-radius: 2rem;
  background: var(--kz-input-bg);
  color: var(--kz-text);
}

.wordset-list {
  display: grid;
  gap: 0.75rem;
}

.wordset-card {
  display: grid;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--kz-border);
  border-radius: 0.75rem;
  background: var(--kz-surface);
}

.wordset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.word-list {
  margin: 0;
  color: var(--kz-text);
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-danger {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}

.btn-danger:hover:not(:disabled) {
  background: #fecaca;
}
</style>
