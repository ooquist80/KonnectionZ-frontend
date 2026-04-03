<template>
  <section class="home-view">
    <h1>KonnectionZ</h1>
    <p v-if="auth.user.value">Signed in as <strong>{{ auth.user.value.username }}</strong></p>
    <div class="actions">
      <RouterLink to="/daily">Play daily puzzle</RouterLink>
      <RouterLink to="/practice">Play practice puzzle</RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../auth/store/authStore'

const auth = useAuthStore()
</script>

<style scoped>
.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>
