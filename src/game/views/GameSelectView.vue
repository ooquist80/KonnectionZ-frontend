<template>
  <section class="game-select-view">
    <h1>Select a game</h1>

    <ApiErrorBanner :message="game.errorMessage.value" />

    <div class="header-actions">
      <p>Select any available game to start playing.</p>
    </div>

    <div v-if="game.gameSets.value.length" class="gameset-list">
      <button
        v-for="set in game.gameSets.value"
        :key="set.id"
        type="button"
        class="gameset-card"
        :disabled="game.isLoading.value"
        @click="openGame(set.id)"
      >
        <strong>{{ set.name }}</strong>
        <span>Start this puzzle.</span>
      </button>
    </div>

    <p v-else-if="!game.isLoading.value" class="empty-state">
      No games are available right now.
    </p>

  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ApiErrorBanner from '../../shared/ui/ApiErrorBanner.vue'
import { useGameStore } from '../store/gameStore'

const game = useGameStore()
const router = useRouter()

onMounted(() => {
  loadGamesets()
})

async function loadGamesets() {
  try {
    await game.loadGameSets()
  } catch {
    // surfaced in store
  }
}

function openGame(gamesetId: number) {
  router.push({ name: 'game-play', params: { gamesetId } })
}
</script>

<style scoped>
.game-select-view {
  gap: 1rem;
}

.header-actions {
  display: grid;
  gap: 0.5rem;
}

.header-actions p,
.active-game p,
.empty-state {
  margin: 0;
  color: #4b5563;
}

.gameset-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.gameset-card {
  display: grid;
  gap: 0.4rem;
  text-align: left;
  padding: 1rem;
  border-radius: 0.75rem;
  font-size: inherit;
  font-weight: normal;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.gameset-card:hover:not(:disabled) {
  border-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.08);
}

.gameset-card span {
  color: #4b5563;
}
</style>
