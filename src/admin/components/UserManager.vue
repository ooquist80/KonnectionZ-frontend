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

        <label>{{ $t('admin.users.scopes') }}</label>
        <ScopePicker v-model="form.scopes" />

        <button type="submit" :disabled="isLoading">{{ isLoading ? $t('admin.users.creating') : $t('admin.users.createUser') }}</button>
      </form>
    </details>

    <!-- All users list -->
    <div class="users-section">
      <h3>{{ $t('admin.users.allUsers') }}</h3>
      <p v-if="usersLoading" class="status-text">{{ $t('admin.users.loadingUsers') }}</p>
      <p v-else-if="!users.length" class="status-text">{{ $t('admin.users.noUsers') }}</p>
      <div v-else class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>{{ $t('admin.users.tableId') }}</th>
              <th>{{ $t('admin.users.tableUsername') }}</th>
              <th>{{ $t('admin.users.tableEmail') }}</th>
              <th class="scopes-column">{{ $t('admin.users.tableScopes') }}</th>
              <th>{{ $t('admin.users.tableActions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td :data-label="$t('admin.users.tableId')">{{ user.id }}</td>
              <td :data-label="$t('admin.users.tableUsername')">{{ user.username }}</td>
              <td :data-label="$t('admin.users.tableEmail')">{{ user.email }}</td>
              <td :data-label="$t('admin.users.tableScopes')" class="scopes-column">
                <div v-if="user.scopes.length" class="table-scope-badges">
                  <span
                    v-for="scope in user.scopes"
                    :key="scope"
                    class="table-scope-badge"
                    :class="getScopeBadgeClass(scope)"
                  >
                    {{ formatScopeLabel(scope) }}
                  </span>
                </div>
                <span v-else>{{ $t('common.none') }}</span>
              </td>
              <td :data-label="$t('admin.users.tableActions')" class="actions-cell">
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
import ScopePicker from './ScopePicker.vue'
import { formatScopeLabel, getScopeBadgeClass, normalizeScopes } from '../../shared/auth/permissions'

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const users = ref<UserRead[]>([])
const usersLoading = ref(false)

const form = reactive({ username: '', email: '', password: '', scopes: ['user:player'] as string[] })

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
      scopes: normalizeScopes(form.scopes).join(',') || undefined,
    })
    form.username = ''
    form.email = ''
    form.password = ''
    form.scopes = ['user:player']
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
  width: 100%;
  min-width: 0;
  border: 1px solid var(--kz-border);
  border-radius: 2rem;
  background: var(--kz-input-bg);
  color: var(--kz-text);
}

.table-scope-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.table-scope-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: var(--kz-glass-strong);
  border: 1px solid var(--kz-border);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.table-scope-badge.scope-badge--play {
  background: #dcfce7;
  border-color: #86efac;
  color: #166534;
}

.table-scope-badge.scope-badge--gamemaster {
  background: #dbeafe;
  border-color: #93c5fd;
  color: #1d4ed8;
}

.table-scope-badge.scope-badge--admin {
  background: #ede9fe;
  border-color: #c4b5fd;
  color: #6d28d9;
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

.users-table-wrap {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.users-table .scopes-column {
  width: 24%;
  min-width: 11rem;
}

.users-table th,
.users-table td {
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--kz-border);
  vertical-align: top;
  overflow-wrap: anywhere;
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
  flex-wrap: wrap;
}

.edit-btn {
  background: rgba(255, 255, 255, 0.06);
  color: var(--kz-text);
  border: 1px solid var(--kz-border);
  padding: 0.45rem 0.8rem;
  border-radius: 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.12s;
}

.edit-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: #93c5fd;
  transform: translateY(-1px);
}

.edit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-btn {
  background: rgba(127, 29, 29, 0.12);
  color: #fecaca;
  border: 1px solid rgba(248, 113, 113, 0.45);
  padding: 0.45rem 0.8rem;
  border-radius: 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.12s;
}

.delete-btn:hover:not(:disabled) {
  background: rgba(127, 29, 29, 0.22);
  border-color: #f87171;
  transform: translateY(-1px);
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 700px) {
  .users-table {
    display: block;
  }

  .users-table thead {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .users-table tbody {
    display: grid;
    gap: 0.75rem;
  }

  .users-table tr {
    display: grid;
    gap: 0.6rem;
    padding: 0.9rem;
    border: 1px solid var(--kz-border);
    border-radius: 0.75rem;
    background: var(--kz-surface);
  }

  .users-table td {
    display: grid;
    grid-template-columns: minmax(6.5rem, 8rem) minmax(0, 1fr);
    gap: 0.4rem 0.75rem;
    padding: 0;
    border-bottom: 0;
  }

  .users-table td::before {
    content: attr(data-label);
    font-size: 0.8rem;
    color: var(--kz-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 600;
  }

  .actions-cell {
    align-items: start;
  }

  .row-actions {
    justify-content: flex-start;
  }
}
</style>
