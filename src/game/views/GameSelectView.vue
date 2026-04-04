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
        <span :class="['game-status', gameStatusClass(set)]">{{ gameStatusLabel(set) }}</span>
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
import type { PlayGameSet } from '../../shared/types/api'

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

function gameStatusLabel(set: PlayGameSet): string {
  if (set.end_time) return 'Completed'
  if (set.start_time) return 'In progress'
  return 'Not played'
}

function gameStatusClass(set: PlayGameSet): string {
  if (set.end_time) return 'status-completed'
  if (set.start_time) return 'status-in-progress'
  return 'status-not-played'
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

.game-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  width: fit-content;
}

.status-not-played {
  background: #f3f4f6;
  color: #6b7280;
}

.status-in-progress {
  background: #fef9c3;
  color: #854d0e;
}

.status-completed {
  background: #dcfce7;
  color: #166534;
}
</style>

