<template>
  <section class="register-view">
    <h1>Create an account</h1>

    <div v-if="successMessage" class="success-banner">{{ successMessage }}</div>
    <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

    <form @submit.prevent="onSubmit">
      <label for="email">Email</label>
      <input id="email" v-model="email" type="email" required autocomplete="email" />

      <label for="username">Username</label>
      <input id="username" v-model="username" required autocomplete="username" />

      <label for="password">Password</label>
      <input id="password" v-model="password" type="password" required autocomplete="new-password" />

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Creating account...' : 'Register' }}
      </button>
    </form>

    <p class="sign-in-link">
      Already have an account? <RouterLink to="/login">Sign in</RouterLink>
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { requestJson } from '../../shared/api/http'
import type { UserRead, UserWrite } from '../../shared/types/api'

const email = ref('')
const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function onSubmit() {
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    const body: UserWrite = {
      email: email.value,
      username: username.value,
      password: password.value,
    }

    await requestJson<UserRead>('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    successMessage.value = 'Account created! You can now sign in.'
    email.value = ''
    username.value = ''
    password.value = ''
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'payload' in err) {
      const payload = (err as { payload: unknown }).payload
      if (payload && typeof payload === 'object' && 'detail' in payload) {
        const detail = (payload as { detail: unknown }).detail
        if (typeof detail === 'string') {
          errorMessage.value = detail
        } else if (Array.isArray(detail)) {
          errorMessage.value = detail.map((d: { msg: string }) => d.msg).join(', ')
        } else {
          errorMessage.value = 'Registration failed. Please try again.'
        }
      } else {
        errorMessage.value = 'Registration failed. Please try again.'
      }
    } else {
      errorMessage.value = 'Registration failed. Please try again.'
    }
  } finally {
    isLoading.value = false
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

.success-banner {
  background: #dcfce7;
  color: #166534;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  max-width: 26rem;
}

.error-banner {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  max-width: 26rem;
}

.sign-in-link {
  margin-top: 1rem;
  font-size: 0.9rem;
}
</style>
