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
    <!-- Theme picker -->
    <div class="section">
      <h2>Background theme</h2>
      <div class="theme-grid">
        <button
          v-for="theme in themeStore.themes"
          :key="theme.id"
          class="theme-swatch"
          :class="{ active: themeStore.activeThemeId.value === theme.id }"
          :style="{ background: `linear-gradient(135deg, ${theme.preview[0]}, ${theme.preview[1]})` }"
          @click="themeStore.setTheme(theme.id)"
        >
          <span class="theme-label" :class="{ 'theme-label--dark': theme.isLight }">{{ theme.label }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../../shared/store/themeStore'
import { buildAvatarSvg } from '../../shared/utils/avatarUtils'

const auth = useAuthStore()
const themeStore = useThemeStore()

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
  color: var(--kz-text-muted);
  text-decoration: none;
}

.back-link:hover {
  color: var(--kz-text);
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
  color: var(--kz-text-muted);
}

.account-card {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid var(--kz-border);
  border-radius: 0.75rem;
  background: var(--kz-surface);
}

.avatar-row {
  display: flex;
  justify-content: center;
}

.avatar-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--kz-btn-hover);
}

.account-row {
  display: grid;
  gap: 0.25rem;
}

.label {
  font-size: 0.85rem;
  color: var(--kz-text-muted);
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
  border: 1px solid var(--kz-border);
  border-radius: 2rem;
  background: var(--kz-input-bg);
  color: var(--kz-text);
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
  background: var(--kz-btn-bg);
  border: 1px solid var(--kz-border);
  border-radius: 2rem;
  padding: 0.4rem 1.1rem;
  font: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  color: var(--kz-btn-text);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.btn-secondary:hover {
  background: var(--kz-btn-hover);
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

.theme-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  max-width: 26rem;
}

.theme-swatch {
  position: relative;
  height: 60px;
  border: 2px solid transparent;
  border-radius: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0.35rem;
  transition: border-color 0.2s, transform 0.15s;
}

.theme-swatch:hover {
  transform: scale(1.05);
  background-blend-mode: normal;
}

.theme-swatch.active {
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.4);
}

.theme-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

.theme-label--dark {
  color: rgba(0, 0, 0, 0.7);
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.4);
}
</style>
