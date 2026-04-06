<template>
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
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(6px);
}
</style>
