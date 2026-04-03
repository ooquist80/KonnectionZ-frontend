<template>
  <section class="profile-view">
    <div class="profile-header">
      <h1>User profile</h1>
      <p>Your current account details.</p>
    </div>

    <div v-if="auth.user.value" class="profile-card">
      <div class="profile-row">
        <span class="label">Username</span>
        <strong>{{ auth.user.value.username }}</strong>
      </div>

      <div class="profile-row">
        <span class="label">Email</span>
        <strong>{{ auth.user.value.email }}</strong>
      </div>

      <div class="profile-row">
        <span class="label">User ID</span>
        <strong>#{{ auth.user.value.id }}</strong>
      </div>

      <div class="profile-row">
        <span class="label">Scopes</span>
        <strong>{{ auth.user.value.scopes.length ? auth.user.value.scopes.join(', ') : 'No scopes assigned' }}</strong>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from '../store/authStore'

const auth = useAuthStore()
</script>

<style scoped>
.profile-view {
  gap: 1rem;
}

.profile-header {
  gap: 0.35rem;
}

.profile-header p {
  margin: 0;
  color: #4b5563;
}

.profile-card {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  background: #ffffff;
}

.profile-row {
  display: grid;
  gap: 0.25rem;
}

.label {
  font-size: 0.85rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>
