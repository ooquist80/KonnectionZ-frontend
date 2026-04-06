<template>
  <section class="admin-view">
    <RouterLink to="/" class="back-link">← Back</RouterLink>
    <h1>Administration</h1>

    <nav class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </nav>

    <GamesetManager v-if="activeTab === 'gamesets'" />
    <WordsetManager v-if="activeTab === 'wordsets'" />
    <UserManager v-if="activeTab === 'users'" />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GamesetManager from '../components/GamesetManager.vue'
import WordsetManager from '../components/WordsetManager.vue'
import UserManager from '../components/UserManager.vue'

const tabs = [
  { id: 'gamesets', label: 'Gamesets' },
  { id: 'wordsets', label: 'Wordsets' },
  { id: 'users', label: 'Users' },
] as const

const activeTab = ref<(typeof tabs)[number]['id']>('gamesets')
</script>

<style scoped>
.back-link {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
  text-decoration: none;
}

.back-link:hover {
  color: #1f2937;
}

.admin-view {
  position: relative;
  gap: 1rem;
}

.tab-bar {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tab-bar button {
  border-radius: 2rem;
}

.tab-bar button.active {
  background: #1f2937;
  color: #fff;
  border-color: #1f2937;
}
</style>
