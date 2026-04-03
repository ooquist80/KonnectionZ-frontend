<template>
  <section class="game-board">
    <h2>{{ title }}</h2>

    <ApiErrorBanner :message="errorMessage" />

    <p v-if="resultMessage" class="result">{{ resultMessage }}</p>

    <div class="panel">
      <h3>Words remaining</h3>
      <ul>
        <li v-for="word in wordsRemaining" :key="word">{{ word }}</li>
      </ul>
    </div>

    <div class="panel">
      <h3>Completed groups</h3>
      <ul>
        <li v-for="group in completedGroups" :key="group.id">
          <strong>{{ group.category }}</strong>
          <span>{{ group.words.map((word) => word.word).join(', ') }}</span>
        </li>
      </ul>
    </div>

    <form class="guess-form" @submit.prevent="onSubmit">
      <label for="guessWords">Submit 4 words (comma-separated)</label>
      <input id="guessWords" v-model="guessInput" placeholder="word1, word2, word3, word4" required />
      <button type="submit" :disabled="isLoading">{{ isLoading ? 'Submitting...' : 'Submit guess' }}</button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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

const guessInput = ref('')

function onSubmit() {
  const words = guessInput.value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  if (words.length !== 4) {
    return
  }

  emit('submitWords', words)
  guessInput.value = ''
}
</script>

<style scoped>
.game-board {
  display: grid;
  gap: 1rem;
}

.panel {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 1rem;
}

.panel ul {
  margin: 0;
  padding-left: 1.25rem;
}

.result {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: #dcfce7;
  color: #166534;
}

.guess-form {
  display: grid;
  gap: 0.5rem;
}

input,
button {
  font: inherit;
  padding: 0.6rem 0.75rem;
}
</style>
