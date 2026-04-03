<template>
  <section class="daily-view">
    <h1>Daily puzzle</h1>

    <button type="button" :disabled="game.isLoading.value" @click="createGame">
      {{ game.currentResult.value ? 'Restart daily game' : 'Start daily game' }}
    </button>

    <GameBoard
      v-if="game.currentResult.value"
      title="Daily Game"
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
import GameBoard from '../components/GameBoard.vue'
import { useGameStore } from '../store/gameStore'

const game = useGameStore()

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
