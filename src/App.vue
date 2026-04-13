<template>
  <ParticleBackground />
  <div class="app-shell">
    <header class="topbar">
      <div class="topbar-left">
        <RouterLink to="/" class="brand">KonnectionZ</RouterLink>
      </div>
      <AvatarMenu v-if="auth.user.value" />
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './auth/store/authStore'
import AvatarMenu from './shared/ui/AvatarMenu.vue'
import ParticleBackground from './shared/ui/ParticleBackground.vue'

const auth = useAuthStore()
const router = useRouter()

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
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand {
  font-weight: 700;
  color: inherit;
  text-decoration: none;
}

main {
  border: 1px solid var(--kz-border);
  border-radius: 0.75rem;
  padding: 1rem;
  background: var(--kz-glass);
  backdrop-filter: blur(6px);
}
</style>
