<template>
  <ParticleBackground />
  <div class="app-shell">
    <header class="topbar">
      <div class="topbar-left">
        <RouterLink to="/" class="brand">KonnectionZ</RouterLink>
      </div>
      <div v-if="auth.user.value" class="topbar-right">
        <button
          v-if="isGameplayRoute"
          type="button"
          class="wake-lock-btn"
          :class="{ 'wake-lock-btn--active': wakeLock.isActive.value }"
          :aria-pressed="wakeLock.isEnabled.value"
          :disabled="!wakeLock.isSupported.value"
          :title="wakeLock.isSupported.value ? $t('shared.wakeLock.tooltip') : $t('shared.wakeLock.unsupported')"
          @click="onToggleWakeLock"
        >
          <span class="wake-lock-label">
            {{ wakeLock.isEnabled.value ? $t('shared.wakeLock.on') : $t('shared.wakeLock.off') }}
          </span>
          <span class="wake-lock-switch" aria-hidden="true">
            <span class="wake-lock-thumb" />
          </span>
        </button>
        <AvatarMenu />
      </div>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './auth/store/authStore'
import AvatarMenu from './shared/ui/AvatarMenu.vue'
import ParticleBackground from './shared/ui/ParticleBackground.vue'
import { useWakeLockStore } from './shared/store/wakeLockStore'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const wakeLock = useWakeLockStore()

const isGameplayRoute = computed(() => route.name === 'daily' || route.name === 'game-play')

onMounted(async () => {
  if (!auth.token.value) {
    return
  }

  try {
    await auth.restoreSession()
  } catch {
    await router.push('/login')
  }
})

watch(isGameplayRoute, (active) => {
  void wakeLock.syncGameplayState(active)
}, { immediate: true })

function onToggleWakeLock() {
  if (!wakeLock.isSupported.value) {
    return
  }

  void wakeLock.toggle()
}
</script>

<style scoped>
.app-shell {
  position: relative;
  z-index: 1;
  max-width: 960px;
  margin: 0 auto;
  padding: 1rem;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 0.75rem;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand {
  font-family: 'Righteous', sans-serif;
  font-weight: 400;
  font-size: 1.5rem;
  letter-spacing: 0.02em;
  color: inherit;
  text-decoration: none;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.wake-lock-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 2.8rem;
  padding: 0.35rem 0.45rem 0.35rem 0.85rem;
  border-radius: 9999px;
  white-space: nowrap;
}

.wake-lock-label {
  line-height: 1;
}

.wake-lock-switch {
  position: relative;
  width: 2.7rem;
  height: 1.55rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: background 0.15s ease, border-color 0.15s ease;
}

.wake-lock-thumb {
  position: absolute;
  top: 50%;
  left: 0.18rem;
  width: 1.05rem;
  height: 1.05rem;
  border-radius: 50%;
  background: #f8fafc;
  transform: translateY(-50%);
  transition: transform 0.15s ease, background 0.15s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.wake-lock-btn--active {
  color: #fef3c7;
}

.wake-lock-btn--active .wake-lock-switch {
  background: #ca8a04;
  border-color: #ca8a04;
}

.wake-lock-btn--active .wake-lock-thumb {
  background: #fffbeb;
  transform: translate(1.1rem, -50%);
}

.wake-lock-btn:disabled .wake-lock-switch {
  opacity: 0.55;
}

main {
  border: 1px solid var(--kz-border);
  border-radius: 0.75rem;
  padding: 1rem;
  background: var(--kz-glass);
  backdrop-filter: blur(6px);
}

@media (max-width: 640px) {
  .wake-lock-btn {
    gap: 0.45rem;
    padding-left: 0.75rem;
    padding-right: 0.4rem;
    font-size: 0.8rem;
  }

  .wake-lock-switch {
    width: 2.45rem;
    height: 1.45rem;
  }

  .wake-lock-thumb {
    width: 0.95rem;
    height: 0.95rem;
  }

  .wake-lock-btn--active .wake-lock-thumb {
    transform: translate(0.95rem, -50%);
  }
}
</style>
