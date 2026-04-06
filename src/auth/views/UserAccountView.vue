<template>
  <section class="account-view">
    <div class="account-header">
      <RouterLink to="/" class="back-link">← Back</RouterLink>
      <h1>User account</h1>
      <p>Manage your account details.</p>
    </div>

    <!-- Read-only account card -->
    <div v-if="auth.user.value" class="account-card">
      <div class="avatar-row">
        <img
          v-if="currentAvatarSvg"
          :src="currentAvatarSvg"
          alt="Your avatar"
          class="avatar-img"
        />
      </div>
      <div class="account-row">
        <span class="label">User ID</span>
        <strong>#{{ auth.user.value.id }}</strong>
      </div>
      <div class="account-row">
        <span class="label">Username</span>
        <strong>{{ auth.user.value.username }}</strong>
      </div>
      <div class="account-row">
        <span class="label">Email</span>
        <strong>{{ auth.user.value.email }}</strong>
      </div>
      <div class="account-row">
        <span class="label">Scopes</span>
        <strong>{{ auth.user.value.scopes.length ? auth.user.value.scopes.join(', ') : 'No scopes assigned' }}</strong>
      </div>
      <div class="card-actions">
        <button class="btn-secondary" @click="toggleEditProfile">
          {{ isEditing ? 'Cancel' : 'Edit account' }}
        </button>
        <RouterLink to="/account/avatar" class="btn-secondary">Edit avatar</RouterLink>
      </div>
    </div>

    <!-- Edit account form -->
    <div v-if="isEditing" class="section">
      <h2>Edit account</h2>
      <div v-if="profileSuccess" class="success-banner">{{ profileSuccess }}</div>
      <div v-if="profileError" class="error-banner">{{ profileError }}</div>
      <form @submit.prevent="onSaveProfile">
        <label for="username">Username</label>
        <input id="username" v-model="username" required autocomplete="username" />

        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" required autocomplete="email" />

        <label class="checkbox-label">
          <input type="checkbox" v-model="showPasswordChange" />
          Change password
        </label>

        <template v-if="showPasswordChange">
          <div v-if="passwordSuccess" class="success-banner">{{ passwordSuccess }}</div>
          <div v-if="passwordError" class="error-banner">{{ passwordError }}</div>

          <label for="new-password">New password</label>
          <input id="new-password" v-model="newPassword" type="password" autocomplete="new-password" />

          <label for="confirm-password">Confirm new password</label>
          <input id="confirm-password" v-model="confirmPassword" type="password" autocomplete="new-password" />
        </template>

        <button type="submit" :disabled="profileLoading || passwordLoading">
          {{ profileLoading || passwordLoading ? 'Saving...' : 'Save changes' }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import { buildAvatarSvg } from '../../shared/utils/avatarUtils'

const auth = useAuthStore()

const currentAvatarSvg = computed(() =>
  auth.user.value?.avatar ? buildAvatarSvg(auth.user.value.avatar) : null,
)

const isEditing = ref(false)
const showPasswordChange = ref(false)
const username = ref(auth.user.value?.username ?? '')
const email = ref(auth.user.value?.email ?? '')

watch(auth.user, (u) => {
  if (u) {
    username.value = u.username
    email.value = u.email
  }
})

function toggleEditProfile() {
  if (isEditing.value) {
    isEditing.value = false
    showPasswordChange.value = false
    newPassword.value = ''
    confirmPassword.value = ''
    profileError.value = ''
    profileSuccess.value = ''
    passwordError.value = ''
    passwordSuccess.value = ''
  } else {
    username.value = auth.user.value?.username ?? ''
    email.value = auth.user.value?.email ?? ''
    profileError.value = ''
    profileSuccess.value = ''
    isEditing.value = true
  }
}

const profileLoading = ref(false)
const profileError = ref('')
const profileSuccess = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

async function onSaveProfile() {
  profileError.value = ''
  profileSuccess.value = ''
  passwordError.value = ''
  passwordSuccess.value = ''

  if (showPasswordChange.value && newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Passwords do not match.'
    return
  }

  profileLoading.value = true
  try {
    await auth.updateProfile({ username: username.value, email: email.value })
    profileSuccess.value = 'Account updated successfully.'
  } catch (err: unknown) {
    profileError.value = extractErrorMessage(err) ?? 'Failed to update account.'
    return
  } finally {
    profileLoading.value = false
  }

  if (showPasswordChange.value && newPassword.value) {
    passwordLoading.value = true
    try {
      await auth.changePassword(username.value, email.value, newPassword.value)
      passwordSuccess.value = 'Password changed successfully.'
      newPassword.value = ''
      confirmPassword.value = ''
      showPasswordChange.value = false
    } catch (err: unknown) {
      passwordError.value = extractErrorMessage(err) ?? 'Failed to change password.'
    } finally {
      passwordLoading.value = false
    }
  }

  if (!passwordError.value) isEditing.value = false
}

function extractErrorMessage(err: unknown): string | null {
  if (err && typeof err === 'object' && 'payload' in err) {
    const payload = (err as { payload: unknown }).payload
    if (payload && typeof payload === 'object' && 'detail' in payload) {
      const detail = (payload as { detail: unknown }).detail
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail)) return detail.map((d: { msg: string }) => d.msg).join(', ')
    }
  }
  if (err instanceof Error) return err.message
  return null
}
</script>

<style scoped>
.back-link {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
  text-decoration: none;
}

.back-link:hover {
  color: #1f2937;
}

.account-view {
  position: relative;
  gap: 1.5rem;
}

.account-header {
  gap: 0.35rem;
}

.account-header p {
  margin: 0;
  color: #4b5563;
}

.account-card {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  background: #ffffff;
}

.avatar-row {
  display: flex;
  justify-content: center;
}

.avatar-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #f3f4f6;
}

.account-row {
  display: grid;
  gap: 0.25rem;
}

.label {
  font-size: 0.85rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.section {
  display: grid;
  gap: 0.75rem;
}

.section h2 {
  font-size: 1.1rem;
  margin: 0;
}

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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  cursor: pointer;
  margin-top: 0.25rem;
}

.checkbox-label input[type='checkbox'] {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.btn-secondary {
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 2rem;
  padding: 0.4rem 1.1rem;
  font: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  color: #374151;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.btn-secondary:hover {
  background: #f3f4f6;
}

.success-banner {
  background: #dcfce7;
  color: #166534;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  max-width: 26rem;
}

.error-banner {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  max-width: 26rem;
}
</style>
