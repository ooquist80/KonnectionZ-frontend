<template>
  <section class="login-view">
    <h1>{{ $t('auth.login.title') }}</h1>

    <ApiErrorBanner :message="auth.errorMessage.value" />

    <form @submit.prevent="onSubmit">
      <label for="username">{{ $t('auth.login.username') }}</label>
      <input id="username" v-model="username" required autocomplete="username" />

      <label for="password">{{ $t('auth.login.password') }}</label>
      <input id="password" v-model="password" type="password" required autocomplete="current-password" />

      <button type="submit" :disabled="auth.isLoading.value">
        {{ auth.isLoading.value ? $t('auth.login.submitting') : $t('auth.login.submit') }}
      </button>
    </form>

    <p class="register-link">
      {{ $t('auth.login.noAccount') }} <RouterLink to="/register">{{ $t('auth.login.register') }}</RouterLink>
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
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
  width: min(100%, 26rem);
  min-width: 0;
}

input {
  font: inherit;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid var(--kz-border);
  border-radius: 2rem;
  background: var(--kz-input-bg);
  color: var(--kz-text);
}
.register-link {
  margin-top: 1rem;
  font-size: 0.9rem;
}
</style>
