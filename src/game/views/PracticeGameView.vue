<template>
  <section class="practice-view">
    <h1>Practice puzzles</h1>

    <ApiErrorBanner :message="game.errorMessage.value" />

    <div class="header-actions">
      <p>Select any available practice game to start playing.</p>
    </div>

    <div v-if="game.practiceSets.value.length" class="gameset-list">
      <button
        v-for="set in game.practiceSets.value"
        :key="set.id"
        type="button"
        class="gameset-card"
        :disabled="game.isLoading.value"
        @click="openPracticeGame(set.id)"
      >
        <strong>{{ set.name }}</strong>
        <span>Start this practice puzzle.</span>
      </button>
    </div>

    <p v-else-if="!game.isLoading.value" class="empty-state">
      No practice games are available right now.
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
    await game.loadPracticeSets()
  } catch {
    // surfaced in store
  }
}

function openPracticeGame(gamesetId: number) {
  router.push({ name: 'practice-play', params: { gamesetId } })
}
</script>

<style scoped>
.practice-view {
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
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  background: #ffffff;
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

button {
  font: inherit;
  padding: 0.5rem 0.75rem;
}
</style>
