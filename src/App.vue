<template>
  <div class="app-shell">
    <header class="topbar">
      <RouterLink to="/" class="brand">KonnectionZ</RouterLink>

      <nav class="nav" v-if="auth.user.value">
        <RouterLink to="/daily">Daily</RouterLink>
        <RouterLink to="/practice">Practice</RouterLink>
      </nav>

      <div class="account" v-if="auth.user.value">
        <span>{{ auth.user.value.username }}</span>
        <button type="button" @click="onLogout">Logout</button>
      </div>
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
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.brand {
  font-weight: 700;
  color: inherit;
  text-decoration: none;
}

.nav,
.account {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

button {
  font: inherit;
  padding: 0.35rem 0.6rem;
}

main {
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  padding: 1rem;
}

@media (max-width: 720px) {
  .topbar {
    grid-template-columns: 1fr;
  }
}
</style>
