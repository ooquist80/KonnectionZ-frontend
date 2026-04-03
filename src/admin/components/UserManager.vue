<template>
  <div class="manager">
    <ApiErrorBanner :message="errorMessage" />

    <!-- Create user form -->
    <details class="create-section" open>
      <summary>Create new user</summary>
      <form class="create-form" @submit.prevent="onCreateUser">
        <label for="u-username">Username</label>
        <input id="u-username" v-model="form.username" required placeholder="johndoe" />

        <label for="u-email">Email</label>
        <input id="u-email" v-model="form.email" type="email" required placeholder="john@example.com" />

        <label for="u-password">Password</label>
        <input id="u-password" v-model="form.password" type="password" required />

        <label for="u-scopes">Scopes</label>
        <input id="u-scopes" v-model="form.scopes" placeholder="user:play" />

        <button type="submit" :disabled="isLoading">{{ isLoading ? 'Creating...' : 'Create user' }}</button>
      </form>
    </details>

    <!-- Lookup user -->
    <details class="create-section">
      <summary>Look up user by ID</summary>
      <form class="create-form" @submit.prevent="onLookupUser">
        <label for="lookup-id">User ID</label>
        <input id="lookup-id" v-model.number="lookupId" type="number" min="1" required />
        <button type="submit" :disabled="isLoading">{{ isLoading ? 'Looking up...' : 'Look up' }}</button>
      </form>
    </details>

    <!-- Results -->
    <div v-if="createdUser" class="result-card success">
      <h3>User created</h3>
      <UserDetail :user="createdUser" />
    </div>

    <div v-if="lookedUpUser" class="result-card">
      <h3>User details</h3>
      <UserDetail :user="lookedUpUser" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, defineComponent, h } from 'vue'
import type { UserRead } from '../../shared/types/api'
import { createUser, getUser } from '../../shared/api/adminApi'
import { useAuthStore } from '../../auth/store/authStore'
import ApiErrorBanner from '../../shared/ui/ApiErrorBanner.vue'

const UserDetail = defineComponent({
  props: { user: { type: Object as () => UserRead, required: true } },
  setup(props) {
    return () =>
      h('dl', { class: 'user-dl' }, [
        h('dt', 'ID'), h('dd', `#${props.user.id}`),
        h('dt', 'Username'), h('dd', props.user.username),
        h('dt', 'Email'), h('dd', props.user.email),
        h('dt', 'Scopes'), h('dd', props.user.scopes.length ? props.user.scopes.join(', ') : 'None'),
      ])
  },
})

const auth = useAuthStore()
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const form = reactive({ username: '', email: '', password: '', scopes: 'user:play' })
const createdUser = ref<UserRead | null>(null)

const lookupId = ref<number>(1)
const lookedUpUser = ref<UserRead | null>(null)

function token(): string {
  return auth.token.value!
}

async function onCreateUser() {
  isLoading.value = true
  errorMessage.value = null
  createdUser.value = null
  try {
    createdUser.value = await createUser(token(), {
      username: form.username,
      email: form.email,
      password: form.password,
      scopes: form.scopes || undefined,
    })
    form.username = ''
    form.email = ''
    form.password = ''
    form.scopes = 'user:play'
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Failed to create user'
  } finally {
    isLoading.value = false
  }
}

async function onLookupUser() {
  isLoading.value = true
  errorMessage.value = null
  lookedUpUser.value = null
  try {
    lookedUpUser.value = await getUser(token(), lookupId.value)
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'User not found'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.manager {
  display: grid;
  gap: 1rem;
}

.create-section {
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  padding: 1rem;
}

summary {
  cursor: pointer;
  font-weight: 600;
}

.create-form {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.75rem;
  max-width: 30rem;
}

.create-form input {
  font: inherit;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 2rem;
}

.result-card {
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  background: #fff;
}

.result-card.success {
  border-color: #86efac;
  background: #f0fdf4;
}

.result-card h3 {
  margin-bottom: 0.5rem;
}

.user-dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 1rem;
  margin: 0;
}

.user-dl dt {
  font-size: 0.85rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.user-dl dd {
  margin: 0;
  font-weight: 600;
}
</style>
