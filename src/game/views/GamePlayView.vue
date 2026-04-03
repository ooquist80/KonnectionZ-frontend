<template>
  <section class="game-play-view">
    <div class="view-header">
      <h1>Puzzle</h1>
      <RouterLink to="/game" class="back-link">Back to game list</RouterLink>
    </div>

    <p v-if="game.isLoading.value && !game.currentResult.value" class="status-message">Loading puzzle...</p>

    <GameBoard
      v-if="game.currentResult.value"
      :title="game.gameName.value ?? 'Game'"
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
import { onMounted, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import GameBoard from '../components/GameBoard.vue'
import { useGameStore } from '../store/gameStore'

const game = useGameStore()
const route = useRoute()
const router = useRouter()

onMounted(() => {
  void loadGame()
})

watch(
  () => route.params.gamesetId,
  () => {
    void loadGame()
  },
)

async function loadGame() {
  const gamesetId = Number(route.params.gamesetId)

  if (!Number.isInteger(gamesetId) || gamesetId <= 0) {
    await router.replace('/game')
    return
  }

  try {
    await game.startGame(gamesetId)
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
.game-play-view {
  gap: 1rem;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.back-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.status-message {
  margin: 0;
  color: #4b5563;
}
</style>
