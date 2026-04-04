<template>
  <div class="app-shell">
    <header class="topbar">
      <RouterLink to="/" class="brand">KonnectionZ</RouterLink>
      <RouterLink v-if="showMainMenuButton" to="/" class="main-menu-button">Main menu</RouterLink>
    </header>

    <main>
      <RouterView />
    </main>

    <div v-if="auth.user.value" class="account-dock">
      <RouterLink to="/profile" class="profile-link">{{ auth.user.value.username }}</RouterLink>
      <button type="button" @click="onLogout">Logout</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './auth/store/authStore'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const showMainMenuButton = computed(() => auth.user.value && route.name !== 'home')

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

function onLogout() {
  auth.logout()
  router.push('/login')
}
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

.brand {
  font-weight: 700;
  color: inherit;
  text-decoration: none;
}

.account-dock {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 12px 32px rgba(17, 24, 39, 0.12);
  z-index: 20;
}

.profile-link {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
}

.main-menu-button {
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  color: #1f2937;
  text-decoration: none;
  border: 1px solid #d1d5db;
  border-radius: 2rem;
  background: #fff;
  transition: background 0.15s;
}

.main-menu-button:hover {
  background: #f3f4f6;
}

main {
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 5rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(6px);
}

@media (max-width: 720px) {
  .account-dock {
    left: 0.75rem;
    right: 0.75rem;
    bottom: 0.75rem;
    justify-content: space-between;
  }
}
</style>
