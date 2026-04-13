<template>
  <section class="avatar-editor-view">
    <div class="view-header">
      <h1>{{ $t('auth.avatarEditor.title') }}</h1>
      <RouterLink to="/account" class="back-link">{{ $t('auth.avatarEditor.backLink') }}</RouterLink>
    </div>

    <div v-if="avatarSuccess" class="success-banner">{{ avatarSuccess }}</div>
    <div v-if="avatarError" class="error-banner">{{ avatarError }}</div>

    <div class="editor-toolbar">
      <button type="button" class="randomize-btn" @click="randomize">🎲 <span class="randomize-label">{{ $t('auth.avatarEditor.randomise') }}</span></button>
    </div>

    <AvatarEditor v-model="pendingAvatarStr" />

    <div class="save-row">
      <button
        type="button"
        class="btn-primary"
        :disabled="avatarLoading || pendingAvatarStr === auth.user.value?.avatar"
        @click="onSaveAvatar"
      >
        {{ avatarLoading ? $t('common.saving') : $t('auth.avatarEditor.saveAvatar') }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../store/authStore'
import { randomizeAvatarOptions, serializeAvatarOptions } from '../../shared/utils/avatarUtils'
import AvatarEditor from '../components/AvatarEditor.vue'

const { t } = useI18n()
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
    avatarSuccess.value = t('auth.avatarEditor.avatarSaved')
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'payload' in err) {
      const payload = (err as { payload: unknown }).payload
      if (payload && typeof payload === 'object' && 'detail' in payload) {
        const detail = (payload as { detail: unknown }).detail
        avatarError.value = typeof detail === 'string' ? detail : t('auth.avatarEditor.saveFailed')
        return
      }
    }
    avatarError.value = err instanceof Error ? err.message : t('auth.avatarEditor.saveFailed')
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
  position: relative;
  gap: 0.25rem;
}

.back-link {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.9rem;
  color: var(--kz-text-muted);
  text-decoration: none;
}

.back-link:hover {
  color: var(--kz-text);
}

.editor-toolbar {
  display: flex;
  justify-content: flex-end;
}

.randomize-btn {
  background: var(--kz-btn-bg);
  border: 1px solid var(--kz-border);
  border-radius: 2rem;
  padding: 0.35rem 0.9rem;
  font: inherit;
  font-size: 0.95rem;
  cursor: pointer;
  color: var(--kz-btn-text);
  white-space: nowrap;
}

.randomize-btn:hover {
  background: var(--kz-btn-hover);
}

@media (max-width: 480px) {
  .randomize-label {
    display: none;
  }

  .randomize-btn {
    padding: 0.35rem 0.55rem;
  }

  .btn-primary {
    width: 100%;
  }
}

.view-header h1 {
  margin: 0;
}

.save-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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
