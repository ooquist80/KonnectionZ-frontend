<template>
  <section class="game-play-view">
    <RouterLink to="/game" class="back-link">← Back</RouterLink>
    <h1>{{ game.gameName.value ?? 'Puzzle' }}</h1>

    <p v-if="game.isLoading.value && !game.currentResult.value" class="status-message">Loading puzzle...</p>

    <GameBoard
      v-if="game.currentResult.value"
      :words-remaining="game.wordsRemaining.value"
      :completed-groups="game.completedGroups.value"
      :miss-count="game.missCount.value"
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
  position: relative;
  gap: 1rem;
}

.back-link {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
  text-decoration: none;
}

.back-link:hover {
  color: #1f2937;
}

.status-message {
  margin: 0;
  color: #4b5563;
}
</style>
