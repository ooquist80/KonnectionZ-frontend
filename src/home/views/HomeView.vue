<template>
  <section class="home-view">
    <div class="hero">
      <h1>Main menu</h1>
      <p v-if="auth.user.value">Welcome back, <strong>{{ auth.user.value.username }}</strong>.</p>
    </div>

    <div class="menu-grid">
      <RouterLink to="/daily" class="menu-card">
        <strong>Daily Game</strong>
        <span>Jump straight into today's puzzle.</span>
      </RouterLink>

      <RouterLink to="/practice" class="menu-card">
        <strong>Practice</strong>
        <span>Browse all available practice games.</span>
      </RouterLink>

      <RouterLink to="/profile" class="menu-card">
        <strong>User Profile</strong>
        <span>View your signed-in account details.</span>
      </RouterLink>

      <RouterLink v-if="isAdmin" to="/admin" class="menu-card menu-card-admin">
        <strong>Administration</strong>
        <span>Manage gamesets, wordsets and users.</span>
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../../auth/store/authStore'

const auth = useAuthStore()
const isAdmin = computed(() => {
  const scopes = auth.user.value?.scopes ?? []
  return scopes.some((s) => s.split(' ').includes('user:admin'))
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
</style>
