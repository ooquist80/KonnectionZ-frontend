<template>
  <section class="register-view">

    <!-- Step indicator -->
    <div class="step-indicator">
      <div class="step-bubble" :class="step === 1 ? 'active' : 'done'">1</div>
      <div class="step-line" :class="{ done: step === 2 }" />
      <div class="step-bubble" :class="step === 2 ? 'active' : ''">2</div>
    </div>

    <!-- ── Step 1: Account details ── -->
    <template v-if="step === 1">
      <h1>Create an account</h1>

      <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

      <form @submit.prevent="onSubmitStep1">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" required autocomplete="email" />

        <label for="username">Username</label>
        <input id="username" v-model="username" required autocomplete="username" />

        <label for="password">Password</label>
        <input id="password" v-model="password" type="password" required autocomplete="new-password" />

        <label for="confirm-password">Confirm password</label>
        <input
          id="confirm-password"
          v-model="confirmPassword"
          type="password"
          required
          autocomplete="new-password"
          :class="{ 'input-error': passwordMismatch }"
        />
        <p v-if="passwordMismatch" class="field-error">Passwords do not match.</p>

        <button type="submit" :disabled="isLoading || passwordMismatch">
          {{ isLoading ? 'Creating account…' : 'Next →' }}
        </button>
      </form>

      <p class="sign-in-link">
        Already have an account? <RouterLink to="/login">Log in</RouterLink>
      </p>
    </template>

    <!-- ── Step 2: Avatar ── -->
    <template v-else>
      <div class="step2-header">
        <div>
          <h1>Create your avatar</h1>
          <p class="step-subtitle">Customise how you appear to other players. You can change this later.</p>
        </div>
        <button type="button" class="randomize-btn" @click="randomize">🎲 <span class="randomize-label">Randomise</span></button>
      </div>

      <div v-if="avatarError" class="error-banner">{{ avatarError }}</div>

      <AvatarEditor v-model="pendingAvatarStr" />

      <div class="save-row">
        <button type="button" class="btn-secondary" @click="skipAvatar">Skip for now</button>
        <button type="button" class="btn-primary" :disabled="isLoading" @click="onSaveAvatar">
          {{ isLoading ? 'Saving…' : 'Save & continue' }}
        </button>
      </div>
    </template>

  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { requestJson } from '../../shared/api/http'
import type { UserRead, UserWrite } from '../../shared/types/api'
import { useAuthStore } from '../store/authStore'
import { randomizeAvatarOptions, serializeAvatarOptions } from '../../shared/utils/avatarUtils'
import AvatarEditor from '../components/AvatarEditor.vue'

const auth = useAuthStore()
const router = useRouter()

// ── Step 1 state ──
const step = ref<1 | 2>(1)
const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const passwordMismatch = computed(
  () => confirmPassword.value.length > 0 && password.value !== confirmPassword.value,
)

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'payload' in err) {
    const detail = (err as { payload?: { detail?: unknown } }).payload?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return detail.map((d: { msg: string }) => d.msg).join(', ')
  }
  return err instanceof Error ? err.message : 'Something went wrong. Please try again.'
}

async function onSubmitStep1() {
  if (passwordMismatch.value) return
  errorMessage.value = ''
  isLoading.value = true

  try {
    const body: UserWrite = { email: email.value, username: username.value, password: password.value }
    await requestJson<UserRead>('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    // Auto-login so we can save avatar in step 2
    await auth.loginWithPassword(username.value, password.value)
    step.value = 2
  } catch (err) {
    errorMessage.value = extractErrorMessage(err)
  } finally {
    isLoading.value = false
  }
}

// ── Step 2 state ──
const pendingAvatarStr = ref(serializeAvatarOptions(randomizeAvatarOptions()))
const avatarError = ref('')

function randomize() {
  pendingAvatarStr.value = serializeAvatarOptions(randomizeAvatarOptions())
}

async function onSaveAvatar() {
  avatarError.value = ''
  isLoading.value = true
  try {
    await auth.saveAvatar(pendingAvatarStr.value)
    await router.push('/')
  } catch (err) {
    avatarError.value = extractErrorMessage(err)
  } finally {
    isLoading.value = false
  }
}

function skipAvatar() {
  void router.push('/')
}
</script>

<style scoped>
.register-view {
  gap: 1.25rem;
}

/* ── Step indicator ── */
.step-indicator {
  display: flex;
  align-items: center;
  gap: 0;
  max-width: 10rem;
}

.step-bubble {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  border: 2px solid #d1d5db;
  background: #fff;
  color: #9ca3af;
  flex-shrink: 0;
}

.step-bubble.active {
  border-color: #16a34a;
  background: #16a34a;
  color: #fff;
}

.step-bubble.done {
  border-color: #16a34a;
  background: #dcfce7;
  color: #16a34a;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #d1d5db;
  transition: background 0.3s;
}

.step-line.done {
  background: #16a34a;
}

/* ── Step 1 form ── */
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

input.input-error {
  border-color: #dc2626;
}

.field-error {
  margin: 0;
  font-size: 0.85rem;
  color: #dc2626;
}

/* ── Step 2 ── */
.step2-header {
  position: relative;
  padding-right: 5rem;
}

.step2-header h1 {
  margin: 0;
}

.randomize-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 2rem;
  padding: 0.35rem 0.9rem;
  font: inherit;
  font-size: 0.95rem;
  cursor: pointer;
  color: #374151;
  white-space: nowrap;
}

.randomize-btn:hover {
  background: #f3f4f6;
}

.step-subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.save-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-secondary {
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 2rem;
  padding: 0.5rem 1.2rem;
  font: inherit;
  font-size: 0.95rem;
  cursor: pointer;
  color: #374151;
}

.btn-secondary:hover {
  background: #f3f4f6;
}

.btn-primary {
  background: #16a34a;
  border: none;
  border-radius: 2rem;
  padding: 0.5rem 1.6rem;
  font: inherit;
  font-size: 0.95rem;
  cursor: pointer;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #15803d;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Shared banners ── */
.error-banner {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  max-width: 26rem;
}

.sign-in-link {
  font-size: 0.9rem;
}

@media (max-width: 480px) {
  .randomize-label {
    display: none;
  }

  .randomize-btn {
    padding: 0.35rem 0.55rem;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
