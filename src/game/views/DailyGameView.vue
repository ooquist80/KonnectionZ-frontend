<template>
  <section class="daily-view">
    <RouterLink to="/" class="back-link">{{ $t('common.back') }}</RouterLink>
    <h1>{{ game.gameName.value ?? $t('game.daily.title') }}</h1>
    <p v-if="game.isLoading.value && !game.currentResult.value" class="status-message">{{ $t('game.daily.loading') }}</p>

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
.back-link {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--kz-text-muted);
  text-decoration: none;
  white-space: nowrap;
}

h1 {
  padding-right: 5rem;
}

.back-link:hover {
  color: var(--kz-text);
}

.daily-view {
  position: relative;
}

.status-message {
  margin: 0;
  color: var(--kz-text-muted);
}
</style>
