<template>
  <section class="game-board">
    <h2>{{ title }}</h2>

    <ApiErrorBanner :message="errorMessage" />

    <p v-if="resultMessage" :class="resultClass">{{ resultMessage }}</p>

    <!-- Completed groups -->
    <div
      v-for="group in completedGroups"
      :key="group.id"
      class="completed-group"
      :class="`difficulty-${group.difficulty}`"
    >
      <strong class="group-category">{{ group.category }}</strong>
      <span class="group-words">{{ group.words.map((w) => w.word).join(', ') }}</span>
    </div>

    <!-- Word grid -->
    <div v-if="wordsRemaining.length" class="word-grid">
      <button
        v-for="word in displayWords"
        :key="word"
        type="button"
        class="word-btn"
        :class="{ selected: selectedWords.has(word) }"
        @click="toggleWord(word)"
      >
        {{ word }}
      </button>
    </div>

    <!-- Actions -->
    <div v-if="wordsRemaining.length" class="actions">
      <span class="selection-count">{{ selectedWords.size }} of 4 selected</span>
      <div class="action-buttons">
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="selectedWords.size === 0"
          @click="deselectAll"
        >
          Deselect all
        </button>
        <button
          type="button"
          class="btn btn-secondary"
          @click="shuffleWords"
        >
          Shuffle
        </button>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="selectedWords.size !== 4 || isLoading"
          @click="onSubmit"
        >
          {{ isLoading ? 'Submitting...' : 'Submit' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { WordsetRead } from '../../shared/types/api'
import ApiErrorBanner from '../../shared/ui/ApiErrorBanner.vue'

const props = defineProps<{
  title: string
  wordsRemaining: string[]
  completedGroups: WordsetRead[]
  resultMessage: string | null
  errorMessage: string | null
  isLoading: boolean
}>()

const emit = defineEmits<{
  submitWords: [words: string[]]
}>()

const selectedWords = reactive(new Set<string>())
const displayWords = ref<string[]>([])

const resultClass = computed(() => {
  const msg = props.resultMessage
  if (!msg) return ''
  if (msg.startsWith('Almost')) return 'result result-almost'
  if (msg.startsWith('Incorrect')) return 'result result-incorrect'
  return 'result result-correct'
})
// Sync local display order with remaining words from the server
watch(
  () => props.wordsRemaining,
  (remaining) => {
    const remainingSet = new Set(remaining)

    // Remove selections that are no longer remaining
    for (const word of selectedWords) {
      if (!remainingSet.has(word)) {
        selectedWords.delete(word)
      }
    }

    // Keep existing order for words still present, append any new ones
    const kept = displayWords.value.filter((w) => remainingSet.has(w))
    const keptSet = new Set(kept)
    const added = remaining.filter((w) => !keptSet.has(w))
    displayWords.value = [...kept, ...added]

    // Auto-select all words when only the last wordset (4 words) remains
    if (remaining.length === 4) {
      for (const word of remaining) {
        selectedWords.add(word)
      }
    }
  },
  { immediate: true },
)

function toggleWord(word: string) {
  if (selectedWords.has(word)) {
    selectedWords.delete(word)
  } else if (selectedWords.size < 4) {
    selectedWords.add(word)
  }
}

function deselectAll() {
  selectedWords.clear()
}

function shuffleWords() {
  const arr = [...displayWords.value]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  displayWords.value = arr
}

function onSubmit() {
  if (selectedWords.size !== 4) return
  emit('submitWords', [...selectedWords])
  selectedWords.clear()
}
</script>

<style scoped>
.game-board {
  display: grid;
  gap: 0.75rem;
  max-width: 480px;
  margin: 0 auto;
}

/* Completed groups */
.completed-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  text-align: center;
}

.group-category {
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.group-words {
  font-size: 0.85rem;
}

.difficulty-1 { background: #fef08a; color: #713f12; }
.difficulty-2 { background: #86efac; color: #14532d; }
.difficulty-3 { background: #93c5fd; color: #1e3a5f; }
.difficulty-4 { background: #c4b5fd; color: #3b0764; }

/* Word grid */
.word-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.word-btn {
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.9rem 0.25rem;
  border: none;
  border-radius: 0.5rem;
  background: #e5e7eb;
  color: #1f2937;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  transition: background 0.15s, color 0.15s, transform 0.1s;
  user-select: none;
  word-break: break-word;
  line-height: 1.2;
}

.word-btn:hover {
  background: #d1d5db;
}

.word-btn:active {
  transform: scale(0.96);
}

.word-btn.selected {
  background: #16a34a;
  color: #fff;
}

.word-btn.selected:hover {
  background: #15803d;
}

/* Result banner */
.result {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  text-align: center;
  font-weight: 500;
}

.result-correct {
  background: #dcfce7;
  color: #166534;
}

.result-almost {
  background: #fef9c3;
  color: #854d0e;
}

.result-incorrect {
  background: #fee2e2;
  color: #991b1b;
}

/* Actions row */
.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.selection-count {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}
</style>
