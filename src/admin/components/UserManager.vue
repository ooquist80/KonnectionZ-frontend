<template>
  <div class="manager">
    <ApiErrorBanner :message="errorMessage" />

    <!-- Create user form -->
    <details class="create-section">
      <summary>{{ $t('admin.users.createTitle') }}</summary>
      <form class="create-form" @submit.prevent="onCreateUser">
        <label for="u-username">{{ $t('admin.users.username') }}</label>
        <input id="u-username" v-model="form.username" required placeholder="johndoe" />

        <label for="u-email">{{ $t('admin.users.email') }}</label>
        <input id="u-email" v-model="form.email" type="email" required placeholder="john@example.com" />

        <label for="u-password">{{ $t('admin.users.password') }}</label>
        <input id="u-password" v-model="form.password" type="password" required />

        <label for="u-scopes">{{ $t('admin.users.scopes') }}</label>
        <input id="u-scopes" v-model="form.scopes" placeholder="user:play,user:admin" />

        <button type="submit" :disabled="isLoading">{{ isLoading ? $t('admin.users.creating') : $t('admin.users.createUser') }}</button>
      </form>
    </details>

    <!-- All users list -->
    <div class="users-section">
      <h3>{{ $t('admin.users.allUsers') }}</h3>
      <p v-if="usersLoading" class="status-text">{{ $t('admin.users.loadingUsers') }}</p>
      <p v-else-if="!users.length" class="status-text">{{ $t('admin.users.noUsers') }}</p>
      <table v-else class="users-table">
        <thead>
          <tr>
            <th>{{ $t('admin.users.tableId') }}</th>
            <th>{{ $t('admin.users.tableUsername') }}</th>
            <th>{{ $t('admin.users.tableEmail') }}</th>
            <th>{{ $t('admin.users.tableScopes') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.scopes.length ? user.scopes.join(', ') : $t('common.none') }}</td>
            <td>
              <div class="row-actions">
                <button
                  class="edit-btn"
                  :disabled="isLoading"
                  @click="router.push({ name: 'admin-user-edit', params: { userId: user.id } })"
                >
                  {{ $t('common.edit') }}
                </button>
                <button
                  class="delete-btn"
                  :disabled="isLoading"
                  @click="onDeleteUser(user.id, user.username)"
                >
                  {{ $t('common.delete') }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { UserRead } from '../../shared/types/api'
import { createUser, listUsers, deleteUser } from '../../shared/api/adminApi'
import { useAuthStore } from '../../auth/store/authStore'
import ApiErrorBanner from '../../shared/ui/ApiErrorBanner.vue'

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const users = ref<UserRead[]>([])
const usersLoading = ref(false)

const form = reactive({ username: '', email: '', password: '', scopes: 'user:play' })

function token(): string {
  return auth.token.value!
}

async function fetchUsers() {
  usersLoading.value = true
  try {
    users.value = await listUsers(token())
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : t('admin.users.loadFailed')
  } finally {
    usersLoading.value = false
  }
}

onMounted(fetchUsers)

async function onCreateUser() {
  isLoading.value = true
  errorMessage.value = null
  try {
    await createUser(token(), {
      username: form.username,
      email: form.email,
      password: form.password,
      scopes: form.scopes || undefined,
    })
    form.username = ''
    form.email = ''
    form.password = ''
    form.scopes = 'user:play'
    await fetchUsers()
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : t('admin.users.createFailed')
  } finally {
    isLoading.value = false
  }
}

async function onDeleteUser(userId: number, username: string) {
  if (!confirm(t('admin.users.confirmDelete', { username, id: userId }))) return
  isLoading.value = true
  errorMessage.value = null
  try {
    await deleteUser(token(), userId)
    await fetchUsers()
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : t('admin.users.deleteFailed')
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
  border: 1px solid var(--kz-border);
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
  border: 1px solid var(--kz-border);
  border-radius: 2rem;
  background: var(--kz-input-bg);
  color: var(--kz-text);
}

.users-section {
  border: 1px solid var(--kz-border);
  border-radius: 0.75rem;
  padding: 1rem;
}

.users-section h3 {
  margin: 0 0 0.75rem;
}

.status-text {
  color: var(--kz-text-muted);
  font-size: 0.9rem;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.users-table th,
.users-table td {
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--kz-border);
}

.users-table th {
  font-size: 0.8rem;
  color: var(--kz-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.users-table tbody tr:hover {
  background: var(--kz-surface-hover);
}

.row-actions {
  display: flex;
  gap: 0.4rem;
}

.edit-btn {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.edit-btn:hover:not(:disabled) {
  background: #dbeafe;
}

.edit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-btn {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.delete-btn:hover:not(:disabled) {
  background: #fecaca;
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
