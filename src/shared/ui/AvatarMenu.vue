<template>
  <div class="avatar-menu" ref="containerRef">
    <button type="button" class="avatar-btn" @click="toggleMenu" :aria-expanded="open">
      <img :src="avatarSrc" alt="Your avatar" class="avatar-img" />
    </button>

    <Transition name="dropdown">
      <div v-if="open" class="dropdown" role="menu">
        <RouterLink to="/" class="dropdown-item" @click="close">
          Main menu
        </RouterLink>
        <hr class="dropdown-divider" />
        <RouterLink to="/account" class="dropdown-item" @click="close">
          Account settings
        </RouterLink>
        <hr class="dropdown-divider" />
        <button type="button" class="dropdown-item dropdown-item--danger" @click="onSignOut">
          Sign out
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { buildAvatarSvg } from '../utils/avatarUtils'
import { useAuthStore } from '../../auth/store/authStore'

const auth = useAuthStore()
const router = useRouter()

const open = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const avatarSrc = computed(() => buildAvatarSvg(auth.user.value?.avatar ?? ''))

function toggleMenu() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function onSignOut() {
  close()
  auth.logout()
  router.push('/login')
}

function onClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    close()
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<style scoped>
.avatar-menu {
  position: relative;
}

.avatar-btn {
  display: flex;
  align-items: center;
  padding: 0;
  background: none;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: border-color 0.15s;
}

.avatar-btn:hover,
.avatar-btn[aria-expanded="true"] {
  border-color: #2563eb;
}

.avatar-img {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 50%;
  display: block;
}

/* ── Dropdown ────────────────────────────────────────────────────────────────── */

.dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 13rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.6rem;
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.12);
  z-index: 50;
  overflow: hidden;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.65rem 1rem;
  font: inherit;
  font-size: 0.9rem;
  text-align: left;
  text-decoration: none;
  color: #1f2937;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.12s;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.dropdown-item--danger {
  color: #dc2626;
}

.dropdown-item--danger:hover {
  background: #fef2f2;
}

.dropdown-divider {
  margin: 0;
  border: none;
  border-top: 1px solid #e5e7eb;
}

/* ── Transition ──────────────────────────────────────────────────────────────── */

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
