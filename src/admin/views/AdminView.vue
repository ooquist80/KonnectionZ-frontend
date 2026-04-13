<template>
  <section class="admin-view">
    <RouterLink to="/" class="back-link">{{ $t('common.back') }}</RouterLink>
    <h1>{{ $t('admin.title') }}</h1>

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
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import GamesetManager from '../components/GamesetManager.vue'
import WordsetManager from '../components/WordsetManager.vue'
import UserManager from '../components/UserManager.vue'

const { t } = useI18n()

type TabId = 'gamesets' | 'wordsets' | 'users'

const tabs = computed(() => [
  { id: 'gamesets' as const, label: t('admin.tabs.gamesets') },
  { id: 'wordsets' as const, label: t('admin.tabs.wordsets') },
  { id: 'users' as const, label: t('admin.tabs.users') },
])

const activeTab = ref<TabId>('gamesets')
</script>

<style scoped>
.back-link {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--kz-text-muted);
  text-decoration: none;
}

.back-link:hover {
  color: var(--kz-text);
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
