<template>
  <section class="login-view">
    <h1>Sign in to KonnectionZ</h1>

    <ApiErrorBanner :message="auth.errorMessage.value" />

    <form @submit.prevent="onSubmit">
      <label for="username">Username</label>
      <input id="username" v-model="username" required autocomplete="username" />

      <label for="password">Password</label>
      <input id="password" v-model="password" type="password" required autocomplete="current-password" />

      <button type="submit" :disabled="auth.isLoading.value">
        {{ auth.isLoading.value ? 'Signing in...' : 'Sign in' }}
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ApiErrorBanner from '../../shared/ui/ApiErrorBanner.vue'
import { useAuthStore } from '../store/authStore'

const username = ref('')
const password = ref('')

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

async function onSubmit() {
  try {
    await auth.loginWithPassword(username.value, password.value)
    const redirectPath = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirectPath)
  } catch {
    // Error already surfaced by store for UI rendering.
  }
}
</script>

<style scoped>
form {
  display: grid;
  gap: 0.5rem;
  max-width: 26rem;
}

input {
  font: inherit;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 2rem;
}
</style>
