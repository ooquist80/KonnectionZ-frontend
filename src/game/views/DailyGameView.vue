<template>
  <section class="daily-view">
    <h1>{{ game.gameName.value ?? 'Daily puzzle' }}</h1>
    <p v-if="game.isLoading.value && !game.currentResult.value" class="status-message">Loading today's puzzle...</p>

    <GameBoard
      v-if="game.currentResult.value"
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
import { onMounted } from 'vue'
import GameBoard from '../components/GameBoard.vue'
import { useGameStore } from '../store/gameStore'

const game = useGameStore()

onMounted(() => {
  createGame()
})

async function createGame() {
  try {
    await game.startDailyGame()
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
.status-message {
  margin: 0;
  color: #4b5563;
}
</style>
