<template>
  <div class="manager">
    <ApiErrorBanner :message="errorMessage" />

    <!-- Create gameset form -->
    <details class="create-section" @toggle="onFormToggle">
      <summary>{{ $t('admin.gamesets.createTitle') }}</summary>
      <form class="create-form" @submit.prevent="onCreateGameset">
        <label for="gs-name">{{ $t('admin.gamesets.name') }}</label>
        <input id="gs-name" v-model="form.name" required placeholder="e.g. Daily 2026-04-03" />

        <label for="gs-daily-date">{{ $t('admin.gamesets.dailyDate') }} <span class="muted">{{ $t('admin.gamesets.dailyDateOptional') }}</span></label>
        <input id="gs-daily-date" type="date" v-model="form.dailyDate" />

        <label>{{ $t('admin.gamesets.selectWordsets') }}</label>
        <p v-if="wordsetsLoading" class="muted">{{ $t('admin.gamesets.loadingWordsets') }}</p>
        <div v-else-if="availableWordsets.length" class="wordset-picker">
          <label
            v-for="ws in availableWordsets"
            :key="ws.id"
            class="picker-item"
            :class="{ picked: form.wordsetIds.has(ws.id) }"
          >
            <input
              type="checkbox"
              :checked="form.wordsetIds.has(ws.id)"
              @change="toggleWordset(ws.id)"
            />
            <strong>{{ ws.category }}</strong>
            <span class="muted">{{ $t('admin.wordsets.difficulty') }} {{ ws.difficulty }} · {{ ws.words.map((w) => w.word).join(', ') }}</span>
          </label>
        </div>
        <p v-else class="muted">{{ $t('admin.gamesets.noWordsets') }}</p>

        <button type="submit" :disabled="isLoading || form.wordsetIds.size !== 4">
          {{ isLoading ? $t('admin.gamesets.creating') : $t('admin.gamesets.createGameset', { count: form.wordsetIds.size }) }}
        </button>
      </form>
    </details>

    <!-- Existing gamesets -->
    <h3>{{ $t('admin.gamesets.existingTitle') }}</h3>
    <p v-if="isLoading && !gamesets.length" class="muted">{{ $t('admin.gamesets.loadingGamesets') }}</p>
    <p v-else-if="!gamesets.length" class="muted">{{ $t('admin.gamesets.noGamesets') }}</p>

    <div v-else class="gameset-list">
      <div v-for="gs in gamesets" :key="gs.id" class="gameset-card">
        <div class="gameset-header">
          <strong>{{ gs.name }}</strong>
          <span class="muted">ID #{{ gs.id }} · {{ new Date(gs.date).toLocaleDateString() }}{{ gs.daily_date ? ' · 📅 ' + new Date(gs.daily_date).toLocaleDateString() : '' }}</span>
        </div>
        <div class="wordset-tags">
          <span v-for="ws in gs.wordsets" :key="ws.id" class="tag">
            {{ ws.category }} ({{ ws.words.map((w) => w.word).join(', ') }})
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GameSetRead, WordsetRead } from '../../shared/types/api'
import { listGamesets, createGameset } from '../../shared/api/adminApi'
import { listWordsets } from '../../shared/api/adminApi'
import { useAuthStore } from '../../auth/store/authStore'
import ApiErrorBanner from '../../shared/ui/ApiErrorBanner.vue'

const { t } = useI18n()
const auth = useAuthStore()
const gamesets = ref<GameSetRead[]>([])
const availableWordsets = ref<WordsetRead[]>([])
const isLoading = ref(false)
const wordsetsLoading = ref(false)
const errorMessage = ref<string | null>(null)

const form = reactive({ name: '', dailyDate: '', wordsetIds: new Set<number>() })

function token(): string {
  return auth.token.value!
}

function toggleWordset(id: number) {
  if (form.wordsetIds.has(id)) {
    form.wordsetIds.delete(id)
  } else {
    form.wordsetIds.add(id)
  }
}

async function loadGamesets() {
  isLoading.value = true
  errorMessage.value = null
  try {
    gamesets.value = await listGamesets(token())
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : t('admin.gamesets.loadFailed')
  } finally {
    isLoading.value = false
  }
}

async function loadWordsets() {
  if (availableWordsets.value.length) return
  wordsetsLoading.value = true
  try {
    availableWordsets.value = await listWordsets(token())
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : t('admin.gamesets.wordsetLoadFailed')
  } finally {
    wordsetsLoading.value = false
  }
}

function onFormToggle(e: Event) {
  if ((e.target as HTMLDetailsElement).open) {
    void loadWordsets()
  }
}

async function onCreateGameset() {
  if (form.wordsetIds.size !== 4) return

  isLoading.value = true
  errorMessage.value = null
  try {
    await createGameset(token(), {
      name: form.name,
      daily_date: form.dailyDate ? new Date(form.dailyDate).toISOString() : null,
      wordsets: [...form.wordsetIds],
    })
    form.name = ''
    form.dailyDate = ''
    form.wordsetIds.clear()
    await loadGamesets()
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : t('admin.gamesets.createFailed')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadGamesets)
</script>

<style scoped>
.manager {
  display: grid;
  gap: 1rem;
}

.muted {
  margin: 0;
  color: var(--kz-text-muted);
}

.create-section {
  border: 1px solid var(--kz-border);
  border-radius: 0.75rem;
  padding: 1rem;
}

summary {
  cursor: pointer;
  font-weight: 600;
}

.create-form {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.create-form input[type="text"],
.create-form input[type="date"],
.create-form > input {
  font: inherit;
  padding: 0.5rem 1rem;
  border: 1px solid var(--kz-border);
  border-radius: 2rem;
  max-width: 30rem;
  background: var(--kz-input-bg);
  color: var(--kz-text);
}

.wordset-picker {
  display: grid;
  gap: 0.5rem;
  max-height: 20rem;
  overflow-y: auto;
}

.picker-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 0.5rem;
  align-items: start;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--kz-border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.picker-item:hover {
  background: var(--kz-surface-hover);
}

.picker-item.picked {
  border-color: #16a34a;
  background: #f0fdf4;
  color: #1f2937;
}

.picker-item input[type="checkbox"] {
  margin-top: 0.15rem;
}

.picker-item .muted {
  grid-column: 2;
  font-size: 0.8rem;
}

.gameset-list {
  display: grid;
  gap: 0.75rem;
}

.gameset-card {
  display: grid;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--kz-border);
  border-radius: 0.75rem;
  background: var(--kz-surface);
}

.gameset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.wordset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tag {
  font-size: 0.8rem;
  padding: 0.25rem 0.6rem;
  background: var(--kz-btn-hover);
  border-radius: 999px;
  color: var(--kz-text);
}
</style>
