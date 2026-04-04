<template>
  <section class="user-edit-view">
    <div class="header">
      <button type="button" class="back-btn" @click="router.push({ name: 'admin' })">← Back</button>
      <h1>Edit user</h1>
    </div>

    <ApiErrorBanner :message="errorMessage" />

    <p v-if="loadingUser" class="status-text">Loading user…</p>

    <form v-else class="edit-form" @submit.prevent="onSubmit">
      <label for="e-username">Username</label>
      <input id="e-username" v-model="form.username" required placeholder="johndoe" />

      <label for="e-email">Email</label>
      <input id="e-email" v-model="form.email" type="email" required placeholder="john@example.com" />

      <label for="e-scopes">Scopes</label>
      <input id="e-scopes" v-model="form.scopes" placeholder="user:play,user:admin" />

      <div class="change-password-toggle">
        <label class="checkbox-label">
          <input id="e-change-pw" v-model="form.changePassword" type="checkbox" />
          Change password
        </label>
      </div>

      <template v-if="form.changePassword">
        <label for="e-password">New password</label>
        <input id="e-password" v-model="form.password" type="password" required placeholder="••••••••" />
      </template>

      <div class="form-actions">
        <button type="submit" :disabled="isSaving">{{ isSaving ? 'Saving…' : 'Save changes' }}</button>
        <button type="button" @click="router.push({ name: 'admin' })">Cancel</button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ApiErrorBanner from '../../shared/ui/ApiErrorBanner.vue'
import { getUser, updateUser } from '../../shared/api/adminApi'
import { useAuthStore } from '../../auth/store/authStore'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const userId = Number(route.params.userId)

const loadingUser = ref(true)
const isSaving = ref(false)
const errorMessage = ref<string | null>(null)

const form = reactive({ username: '', email: '', password: '', scopes: '', changePassword: false })

function token(): string {
  return auth.token.value!
}

onMounted(async () => {
  try {
    const user = await getUser(token(), userId)
    form.username = user.username
    form.email = user.email
    form.scopes = user.scopes.join(',')
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Failed to load user'
  } finally {
    loadingUser.value = false
  }
})

async function onSubmit() {
  isSaving.value = true
  errorMessage.value = null
  try {
    await updateUser(token(), userId, {
      username: form.username,
      email: form.email,
      password: form.password || 'unused',
      scopes: form.scopes || undefined,
    }, form.changePassword)
    router.push({ name: 'admin' })
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Failed to update user'
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.user-edit-view {
  gap: 1rem;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header h1 {
  margin: 0;
}

.back-btn {
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 2rem;
  padding: 0.35rem 0.9rem;
  font-size: 0.875rem;
  cursor: pointer;
  color: #374151;
  transition: border-color 0.15s;
}

.back-btn:hover {
  border-color: #6b7280;
}

.status-text {
  color: #6b7280;
}

.edit-form {
  display: grid;
  gap: 0.5rem;
  max-width: 30rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.edit-form input {
  font: inherit;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 2rem;
}

.field-hint {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: normal;
}

.change-password-toggle {
  margin-top: 0.25rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.checkbox-label input[type='checkbox'] {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  padding: 0;
  border-radius: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
</style>
