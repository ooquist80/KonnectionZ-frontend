<template>
  <div class="manager">
    <ApiErrorBanner :message="errorMessage" />

    <!-- Create wordset form -->
    <details class="create-section">
      <summary>Create new wordset</summary>
      <form class="create-form" @submit.prevent="onCreateWordset">
        <label for="ws-category">Category</label>
        <input id="ws-category" v-model="form.category" required placeholder="e.g. Fruits" />

        <label for="ws-difficulty">Difficulty (1–4)</label>
        <input id="ws-difficulty" v-model.number="form.difficulty" type="number" min="1" max="4" required />

        <label for="ws-words">Words (comma-separated, min 4)</label>
        <input id="ws-words" v-model="form.wordsRaw" required placeholder="apple, banana, cherry, date" />

        <button type="submit" :disabled="isLoading">{{ isLoading ? 'Creating...' : 'Create wordset' }}</button>
      </form>
    </details>

    <!-- Existing wordsets -->
    <h3>Existing wordsets</h3>
    <p v-if="isLoading && !wordsets.length" class="muted">Loading wordsets...</p>
    <p v-else-if="!wordsets.length" class="muted">No wordsets found.</p>

    <div v-else class="wordset-list">
      <div v-for="ws in wordsets" :key="ws.id" class="wordset-card">
        <div class="wordset-header">
          <strong>{{ ws.category }}</strong>
          <span class="muted">Difficulty {{ ws.difficulty }} · ID #{{ ws.id }}</span>
        </div>
        <p class="word-list">{{ ws.words.map((w) => w.word).join(', ') }}</p>
        <div class="card-actions">
          <button type="button" @click="beginEdit(ws)">Edit</button>
          <button type="button" class="btn-danger" :disabled="isLoading" @click="onDelete(ws.id)">Delete</button>
        </div>

        <!-- Inline edit -->
        <form v-if="editingId === ws.id" class="edit-form" @submit.prevent="onSaveEdit">
          <label>Category</label>
          <input v-model="editForm.category" required />
          <label>Difficulty (1–4)</label>
          <input v-model.number="editForm.difficulty" type="number" min="1" max="4" required />
          <label>Words (comma-separated)</label>
          <input v-model="editForm.wordsRaw" required />
          <div class="card-actions">
            <button type="submit" :disabled="isLoading">Save</button>
            <button type="button" @click="editingId = null">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import type { WordsetRead } from '../../shared/types/api'
import { listWordsets, createWordset, updateWordset, deleteWordset } from '../../shared/api/adminApi'
import { useAuthStore } from '../../auth/store/authStore'
import ApiErrorBanner from '../../shared/ui/ApiErrorBanner.vue'

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

function parseWords(raw: string): string[] {
  return raw.split(',').map((w) => w.trim()).filter((w) => w.length > 0)
}

async function loadWordsets() {
  isLoading.value = true
  errorMessage.value = null
  try {
    wordsets.value = await listWordsets(token())
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Failed to load wordsets'
  } finally {
    isLoading.value = false
  }
}

async function onCreateWordset() {
  const words = parseWords(form.wordsRaw)
  if (words.length < 4) { errorMessage.value = 'A wordset needs at least 4 words'; return }

  isLoading.value = true
  errorMessage.value = null
  try {
    await createWordset(token(), { category: form.category, difficulty: form.difficulty, words })
    form.category = ''
    form.difficulty = 1
    form.wordsRaw = ''
    await loadWordsets()
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Failed to create wordset'
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
  const words = parseWords(editForm.wordsRaw)
  if (words.length < 4) { errorMessage.value = 'A wordset needs at least 4 words'; return }

  isLoading.value = true
  errorMessage.value = null
  try {
    await updateWordset(token(), editingId.value, { category: editForm.category, difficulty: editForm.difficulty, words })
    editingId.value = null
    await loadWordsets()
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Failed to update wordset'
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
    errorMessage.value = e instanceof Error ? e.message : 'Failed to delete wordset'
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
  color: #6b7280;
}

.create-section {
  border: 1px solid #d1d5db;
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
  border: 1px solid #d1d5db;
  border-radius: 2rem;
}

.wordset-list {
  display: grid;
  gap: 0.75rem;
}

.wordset-card {
  display: grid;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  background: #fff;
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
  color: #374151;
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
