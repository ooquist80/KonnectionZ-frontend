<template>
  <section class="practice-view">
    <h1>Practice puzzles</h1>

    <ApiErrorBanner :message="game.errorMessage.value" />

    <div class="controls">
      <button type="button" :disabled="game.isLoading.value" @click="loadGamesets">Load gamesets</button>
      <select v-model.number="selectedGamesetId">
        <option :value="0">Choose gameset</option>
        <option v-for="set in game.practiceSets.value" :key="set.id" :value="set.id">{{ set.name }}</option>
      </select>
      <button type="button" :disabled="!selectedGamesetId || game.isLoading.value" @click="startPractice">
        Start selected practice game
      </button>
    </div>

    <GameBoard
      v-if="game.currentResult.value"
      title="Practice Game"
      :words-remaining="game.wordsRemaining.value"
      :completed-groups="game.completedGroups.value"
      :result-message="game.resultMessage.value"
      :error-message="game.errorMessage.value"
      :is-loading="game.isLoading.value"
      @submit-words="onSubmitWords"
    />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ApiErrorBanner from '../../shared/ui/ApiErrorBanner.vue'
import GameBoard from '../components/GameBoard.vue'
import { useGameStore } from '../store/gameStore'

const game = useGameStore()
const selectedGamesetId = ref(0)

async function loadGamesets() {
  try {
    await game.loadPracticeSets()
  } catch {
    // surfaced in store
  }
}

async function startPractice() {
  if (!selectedGamesetId.value) {
    return
  }

  try {
    await game.startPracticeGame(selectedGamesetId.value)
  } catch {
    // surfaced in store
  }
}

async function onSubmitWords(words: string[]) {
  try {
    await game.submitWords(words)
  } catch {
    // surfaced in store
  }
}
</script>

<style scoped>
.controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

select,
button {
  font: inherit;
  padding: 0.5rem 0.75rem;
}
</style>
