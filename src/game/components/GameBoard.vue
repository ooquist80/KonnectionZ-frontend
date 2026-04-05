<template>
  <section class="game-board">
    <ApiErrorBanner :message="errorMessage" />

    <!-- Floating result toast -->
    <Transition name="toast">
      <div v-if="toastMessage" class="toast" :class="toastClass">
        {{ toastMessage }}
      </div>
    </Transition>

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
        :class="{ selected: selectedWords.has(word), shake: isShaking && selectedWords.has(word) }"
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
import { nextTick, reactive, ref, watch } from 'vue'
import type { WordsetRead } from '../../shared/types/api'
import ApiErrorBanner from '../../shared/ui/ApiErrorBanner.vue'

const props = defineProps<{
  wordsRemaining: string[]
  completedGroups: WordsetRead[]
  resultMessage: string | null
  errorMessage: string | null
  isLoading: boolean
}>()

const emit = defineEmits<{
  submitWords: [words: string[]]
}>()

// ── Toast ─────────────────────────────────────────────────────────────────────

const toastMessage = ref<string | null>(null)
const toastClass = ref('')

let toastTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.resultMessage,
  (msg) => {
    if (!msg) return
    if (toastTimer) clearTimeout(toastTimer)

    if (msg.startsWith('Almost')) toastClass.value = 'toast-almost'
    else if (msg.startsWith('Incorrect')) toastClass.value = 'toast-incorrect'
    else toastClass.value = 'toast-correct'

    toastMessage.value = msg
    toastTimer = setTimeout(() => { toastMessage.value = null }, 2200)
  },
)

// ── Shake ─────────────────────────────────────────────────────────────────────

const isShaking = ref(false)
let shakeTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.resultMessage,
  (msg) => {
    if (msg?.startsWith('Incorrect') || msg?.startsWith('Almost')) {
      if (shakeTimer) clearTimeout(shakeTimer)
      isShaking.value = false
      nextTick(() => {
        isShaking.value = true
        shakeTimer = setTimeout(() => { isShaking.value = false }, 600)
      })
    }
  },
)

// ── Word grid ─────────────────────────────────────────────────────────────────

const selectedWords = reactive(new Set<string>())
const displayWords = ref<string[]>([])

watch(
  () => props.wordsRemaining,
  (remaining) => {
    const remainingSet = new Set(remaining)

    for (const word of selectedWords) {
      if (!remainingSet.has(word)) selectedWords.delete(word)
    }

    const kept = displayWords.value.filter((w) => remainingSet.has(w))
    const keptSet = new Set(kept)
    const added = remaining.filter((w) => !keptSet.has(w))
    displayWords.value = [...kept, ...added]

    if (remaining.length === 4) {
      for (const word of remaining) selectedWords.add(word)
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
}
</script>

<style scoped>
.game-board {
  display: grid;
  gap: 0.75rem;
  max-width: 480px;
  margin: 0 auto;
  position: relative;
}

/* ── Toast ───────────────────────────────────────────────────────────────────── */

.toast {
  position: absolute;
  top: -0.5rem;
  left: 50%;
  transform: translateX(-50%) translateY(-100%);
  white-space: nowrap;
  padding: 0.55rem 1.25rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 600;
  pointer-events: none;
  z-index: 10;
}

.toast-correct   { background: #16a34a; color: #fff; }
.toast-almost    { background: #d97706; color: #fff; }
.toast-incorrect { background: #dc2626; color: #fff; }

.toast-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.toast-leave-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(-50%) translateY(-80%); }
.toast-leave-to     { opacity: 0; transform: translateX(-50%) translateY(-110%); }

/* ── Completed groups ────────────────────────────────────────────────────────── */

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

.difficulty-1 { background: #bbf7d0; color: #14532d; }
.difficulty-2 { background: #86efac; color: #14532d; }
.difficulty-3 { background: #93c5fd; color: #1e3a5f; }
.difficulty-4 { background: #c4b5fd; color: #3b0764; }

/* ── Word grid ───────────────────────────────────────────────────────────────── */

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

.word-btn:hover  { background: #d1d5db; }
.word-btn:active { transform: scale(0.96); }

.word-btn.selected       { background: #2563eb; color: #fff; }
.word-btn.selected:hover { background: #1d4ed8; }

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  15%       { transform: translateX(-6px); }
  35%       { transform: translateX(6px); }
  55%       { transform: translateX(-4px); }
  75%       { transform: translateX(4px); }
}

.word-btn.shake { animation: shake 0.5s ease-in-out; }

/* ── Actions ─────────────────────────────────────────────────────────────────── */

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
