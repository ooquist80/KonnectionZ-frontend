<template>
  <section class="avatar-editor-view">
    <div class="view-header">
      <RouterLink to="/profile" class="back-link">← Profile</RouterLink>
      <h1>Edit avatar</h1>
    </div>

    <div v-if="avatarSuccess" class="success-banner">{{ avatarSuccess }}</div>
    <div v-if="avatarError" class="error-banner">{{ avatarError }}</div>

    <AvatarEditor v-model="pendingAvatarStr" />

    <div class="save-row">
      <button type="button" class="btn-secondary" @click="randomize">🎲 Randomise</button>
      <button
        type="button"
        class="btn-primary"
        :disabled="avatarLoading || pendingAvatarStr === auth.user.value?.avatar"
        @click="onSaveAvatar"
      >
        {{ avatarLoading ? 'Saving...' : 'Save avatar' }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import { randomizeAvatarOptions, serializeAvatarOptions } from '../../shared/utils/avatarUtils'
import AvatarEditor from '../components/AvatarEditor.vue'

const auth = useAuthStore()

const pendingAvatarStr = ref(auth.user.value?.avatar ?? '')
const avatarLoading = ref(false)
const avatarError = ref('')
const avatarSuccess = ref('')

function randomize() {
  pendingAvatarStr.value = serializeAvatarOptions(randomizeAvatarOptions())
}

async function onSaveAvatar() {
  avatarSuccess.value = ''
  avatarLoading.value = true
  try {
    await auth.saveAvatar(pendingAvatarStr.value)
    avatarSuccess.value = 'Avatar saved!'
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'payload' in err) {
      const payload = (err as { payload: unknown }).payload
      if (payload && typeof payload === 'object' && 'detail' in payload) {
        const detail = (payload as { detail: unknown }).detail
        avatarError.value = typeof detail === 'string' ? detail : 'Failed to save avatar.'
        return
      }
    }
    avatarError.value = err instanceof Error ? err.message : 'Failed to save avatar.'
  } finally {
    avatarLoading.value = false
  }
}
</script>

<style scoped>
.avatar-editor-view {
  gap: 1.25rem;
}

.view-header {
  gap: 0.25rem;
}

.back-link {
  font-size: 0.9rem;
  color: #6b7280;
  text-decoration: none;
}

.back-link:hover {
  color: #111827;
}

.view-header h1 {
  margin: 0;
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
