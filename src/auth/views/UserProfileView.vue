<template>
  <section class="profile-view">
    <div class="profile-header">
      <h1>User profile</h1>
      <p>Manage your account details.</p>
    </div>

    <div v-if="auth.user.value" class="profile-card">
      <div class="profile-row">
        <span class="label">User ID</span>
        <strong>#{{ auth.user.value.id }}</strong>
      </div>
      <div class="profile-row">
        <span class="label">Scopes</span>
        <strong>{{ auth.user.value.scopes.length ? auth.user.value.scopes.join(', ') : 'No scopes assigned' }}</strong>
      </div>
    </div>

    <!-- Edit username & email -->
    <div class="section">
      <h2>Edit profile</h2>
      <div v-if="profileSuccess" class="success-banner">{{ profileSuccess }}</div>
      <div v-if="profileError" class="error-banner">{{ profileError }}</div>
      <form @submit.prevent="onSaveProfile">
        <label for="username">Username</label>
        <input id="username" v-model="username" required autocomplete="username" />

        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" required autocomplete="email" />

        <button type="submit" :disabled="profileLoading">
          {{ profileLoading ? 'Saving...' : 'Save changes' }}
        </button>
      </form>
    </div>

    <!-- Change password -->
    <div class="section">
      <h2>Change password</h2>
      <div v-if="passwordSuccess" class="success-banner">{{ passwordSuccess }}</div>
      <div v-if="passwordError" class="error-banner">{{ passwordError }}</div>
      <form @submit.prevent="onChangePassword">
        <label for="new-password">New password</label>
        <input id="new-password" v-model="newPassword" type="password" required autocomplete="new-password" />

        <label for="confirm-password">Confirm new password</label>
        <input id="confirm-password" v-model="confirmPassword" type="password" required autocomplete="new-password" />

        <button type="submit" :disabled="passwordLoading">
          {{ passwordLoading ? 'Updating...' : 'Change password' }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '../store/authStore'

const auth = useAuthStore()

const username = ref(auth.user.value?.username ?? '')
const email = ref(auth.user.value?.email ?? '')

// Keep form in sync if user loads after mount
watch(auth.user, (u) => {
  if (u) {
    username.value = u.username
    email.value = u.email
  }
})

const profileLoading = ref(false)
const profileError = ref('')
const profileSuccess = ref('')

async function onSaveProfile() {
  profileError.value = ''
  profileSuccess.value = ''
  profileLoading.value = true
  try {
    await auth.updateProfile({ username: username.value, email: email.value })
    profileSuccess.value = 'Profile updated successfully.'
  } catch (err: unknown) {
    profileError.value = extractErrorMessage(err) ?? 'Failed to update profile.'
  } finally {
    profileLoading.value = false
  }
}

const newPassword = ref('')
const confirmPassword = ref('')
const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

async function onChangePassword() {
  passwordError.value = ''
  passwordSuccess.value = ''

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Passwords do not match.'
    return
  }

  passwordLoading.value = true
  try {
    await auth.changePassword(
      auth.user.value!.username,
      auth.user.value!.email,
      newPassword.value,
    )
    passwordSuccess.value = 'Password changed successfully.'
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err: unknown) {
    passwordError.value = extractErrorMessage(err) ?? 'Failed to change password.'
  } finally {
    passwordLoading.value = false
  }
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
.profile-view {
  gap: 1.5rem;
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

