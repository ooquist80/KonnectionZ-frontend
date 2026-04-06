<template>
  <section class="home-view">
    <div class="hero">
      <h1>Main menu</h1>
      <p v-if="auth.user.value">Welcome back, <strong>{{ auth.user.value.username }}</strong>.</p>
    </div>

    <div class="menu-grid">
      <RouterLink
        to="/daily"
        class="menu-card"
        :class="dailyCardClass"
      >
        <div class="card-title-row">
          <strong>Daily Game</strong>
          <span v-if="dailyStatus === 'completed'" class="daily-badge daily-badge--done">✓ Completed</span>
          <span v-else-if="dailyStatus === 'in-progress'" class="daily-badge daily-badge--progress">In progress</span>
        </div>
        <span>{{ dailySubtitle }}</span>
      </RouterLink>

      <RouterLink to="/game" class="menu-card">
        <strong>Select a game</strong>
        <span>{{ gameSelectSubtitle }}</span>
      </RouterLink>

      <RouterLink to="/account" class="menu-card">
        <strong>User account</strong>
        <span>View your signed-in account details.</span>
      </RouterLink>

      <RouterLink v-if="isAdmin" to="/admin" class="menu-card menu-card-admin">
        <strong>Administration</strong>
        <span>Manage gamesets, wordsets and users.</span>
      </RouterLink>
    </div>

    <AnnouncementsSection v-if="auth.user.value" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../../auth/store/authStore'
import AnnouncementsSection from '../../shared/ui/AnnouncementsSection.vue'
import { getDailyGameset, listGamesets } from '../../shared/api/playApi'
import type { PlayGameSet } from '../../shared/types/api'

const auth = useAuthStore()
const isAdmin = computed(() => {
  const scopes = auth.user.value?.scopes ?? []
  return scopes.some((s) => s.split(' ').includes('user:admin'))
})

const dailyGame = ref<PlayGameSet | null>(null)
const gameSets = ref<PlayGameSet[]>([])

const totalGames = computed(() => gameSets.value.length)
const completedGames = computed(() => gameSets.value.filter((s) => s.end_time).length)
const gameSelectSubtitle = computed(() => {
  if (!totalGames.value) return 'Browse all available games.'
  return `${completedGames.value} of ${totalGames.value} completed`
})

const dailyStatus = computed(() => {
  if (!dailyGame.value) return 'unknown'
  if (dailyGame.value.end_time) return 'completed'
  if (dailyGame.value.start_time) return 'in-progress'
  return 'not-started'
})

const dailyCardClass = computed(() => ({
  'menu-card--completed': dailyStatus.value === 'completed',
  'menu-card--in-progress': dailyStatus.value === 'in-progress',
}))

const dailySubtitle = computed(() => {
  if (dailyStatus.value === 'completed') {
    const misses = dailyGame.value?.miss_count ?? 0
    return misses === 0 ? 'Completed with no misses!' : `Completed · ${misses} miss${misses === 1 ? '' : 'es'}`
  }
  if (dailyStatus.value === 'in-progress') return 'Come back and finish today\'s puzzle!'
  return 'Jump straight into today\'s puzzle.'
})

onMounted(async () => {
  if (!auth.token.value) return
  await Promise.allSettled([
    getDailyGameset(auth.token.value).then((d) => { dailyGame.value = d }).catch(() => {}),
    listGamesets(auth.token.value).then((s) => { gameSets.value = s }).catch(() => {}),
  ])
})
</script>

<style scoped>
.home-view {
  gap: 1.5rem;
}

.hero {
  gap: 0.5rem;
}

.hero p {
  margin: 0;
  color: #4b5563;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.menu-card {
  display: grid;
  gap: 0.5rem;
  padding: 1.25rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  color: inherit;
  text-decoration: none;
  background: #ffffff;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.menu-card:hover {
  border-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.08);
}

.menu-card span {
  color: #4b5563;
}

.menu-card-admin {
  border-color: #c4b5fd;
}

.menu-card-admin:hover {
  border-color: #7c3aed;
  box-shadow: 0 10px 24px rgba(124, 58, 237, 0.08);
}

.menu-card--completed {
  border-color: #86efac;
  background: #f0fdf4;
}

.menu-card--completed:hover {
  border-color: #16a34a;
  box-shadow: 0 10px 24px rgba(22, 163, 74, 0.1);
}

.menu-card--in-progress {
  border-color: #fde68a;
  background: #fffbeb;
}

.menu-card--in-progress:hover {
  border-color: #d97706;
  box-shadow: 0 10px 24px rgba(217, 119, 6, 0.1);
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.daily-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
}

.daily-badge--done {
  background: #dcfce7;
  color: #166534;
}

.daily-badge--progress {
  background: #fef9c3;
  color: #854d0e;
}
</style>
