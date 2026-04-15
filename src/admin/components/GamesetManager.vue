<template>
  <div class="manager">
    <ApiErrorBanner :message="errorMessage" />

    <section class="create-section">
      <div class="section-heading">
        <div>
          <h3>{{ $t('admin.gamesets.createTitle') }}</h3>
          <p class="muted">{{ $t('admin.gamesets.createDescription') }}</p>
        </div>
        <span class="selection-pill">
          {{ $t('admin.gamesets.selectedCount', { count: selectedWordsets.length }) }}
        </span>
      </div>

      <div class="builder-grid">
        <form class="panel gameset-form" @submit.prevent="onCreateGameset">
          <h4>{{ $t('admin.gamesets.detailsTitle') }}</h4>

          <label for="gs-name">{{ $t('admin.gamesets.name') }}</label>
          <input id="gs-name" v-model="form.name" type="text" required placeholder="e.g. Daily 2026-04-03" />

          <label for="gs-daily-date">
            {{ $t('admin.gamesets.dailyDate') }}
            <span class="muted">{{ $t('admin.gamesets.dailyDateOptional') }}</span>
          </label>
          <input id="gs-daily-date" type="date" v-model="form.dailyDate" />

          <div class="selected-summary">
            <div class="section-subheading">
              <h4>{{ $t('admin.gamesets.selectionTitle') }}</h4>
              <span class="muted">{{ $t('admin.gamesets.selectedCount', { count: selectedWordsets.length }) }}</span>
            </div>
            <p class="muted">{{ $t('admin.gamesets.selectionHelp') }}</p>

            <div v-if="selectedWordsets.length" class="selected-wordsets">
              <div v-for="ws in selectedWordsets" :key="ws.id" class="selected-card">
                <strong>{{ ws.category }}</strong>
                <span class="muted">{{ $t('admin.wordsets.difficulty') }} {{ ws.difficulty }}</span>
                <span class="selected-words">{{ ws.words.map((w) => w.word).join(', ') }}</span>
              </div>
            </div>
            <p v-else class="muted">{{ $t('admin.gamesets.selectionEmpty') }}</p>
          </div>

          <button type="submit" :disabled="createGamesetLoading || selectedWordsets.length !== 4">
            {{ createGamesetLoading ? $t('admin.gamesets.creating') : $t('admin.gamesets.createGameset', { count: selectedWordsets.length }) }}
          </button>
        </form>

        <form class="panel quick-wordset-form" @submit.prevent="onCreateWordset">
          <div class="section-subheading">
            <h4>{{ $t('admin.gamesets.quickWordsetTitle') }}</h4>
            <span class="muted">{{ $t('admin.gamesets.quickWordsetHelp') }}</span>
          </div>

          <label for="ws-category">{{ $t('admin.wordsets.category') }}</label>
          <input id="ws-category" v-model="wordsetForm.category" required placeholder="e.g. Fruits" />

          <label for="ws-difficulty">{{ $t('admin.wordsets.difficulty') }}</label>
          <input id="ws-difficulty" v-model.number="wordsetForm.difficulty" type="number" min="1" max="4" required />

          <label for="ws-words">{{ $t('admin.wordsets.words') }}</label>
          <input id="ws-words" v-model="wordsetForm.wordsRaw" required placeholder="apple, banana, cherry, date" />

          <button type="submit" :disabled="createWordsetLoading">
            {{ createWordsetLoading ? $t('admin.wordsets.creating') : $t('admin.wordsets.createWordset') }}
          </button>
        </form>
      </div>

      <div class="picker-section">
        <div class="section-subheading">
          <h4>{{ $t('admin.gamesets.availableWordsetsTitle') }}</h4>
          <span class="muted">{{ $t('admin.gamesets.selectionHelp') }}</span>
        </div>

        <p v-if="wordsetsLoading" class="muted">{{ $t('admin.gamesets.loadingWordsets') }}</p>
        <div v-else-if="availableWordsets.length" class="wordset-picker">
          <label
            v-for="ws in orderedWordsets"
            :key="ws.id"
            class="picker-item"
            :class="{ picked: form.wordsetIds.has(ws.id), disabled: isSelectionLocked && !form.wordsetIds.has(ws.id) }"
          >
            <input
              type="checkbox"
              :checked="form.wordsetIds.has(ws.id)"
              :disabled="isSelectionLocked && !form.wordsetIds.has(ws.id)"
              @change="toggleWordset(ws.id)"
            />
            <strong>{{ ws.category }}</strong>
            <span class="muted">{{ $t('admin.wordsets.difficulty') }} {{ ws.difficulty }} · {{ ws.words.map((w) => w.word).join(', ') }}</span>
          </label>
        </div>
        <p v-else class="muted">{{ $t('admin.gamesets.noWordsets') }}</p>
      </div>
    </section>

    <h3>{{ $t('admin.gamesets.existingTitle') }}</h3>
    <p v-if="gamesetsLoading && !gamesets.length" class="muted">{{ $t('admin.gamesets.loadingGamesets') }}</p>
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
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GameSetRead, WordsetRead } from '../../shared/types/api'
import { listGamesets, createGameset, listWordsets, createWordset } from '../../shared/api/adminApi'
import { useAuthStore } from '../../auth/store/authStore'
import ApiErrorBanner from '../../shared/ui/ApiErrorBanner.vue'
import { parseWordsInput } from '../utils/wordsetForm'

const { t } = useI18n()
const auth = useAuthStore()
const gamesets = ref<GameSetRead[]>([])
const availableWordsets = ref<WordsetRead[]>([])
const gamesetsLoading = ref(false)
const wordsetsLoading = ref(false)
const createGamesetLoading = ref(false)
const createWordsetLoading = ref(false)
const errorMessage = ref<string | null>(null)

const form = reactive({ name: '', dailyDate: '', wordsetIds: new Set<number>() })
const wordsetForm = reactive({ category: '', difficulty: 1, wordsRaw: '' })

const selectedWordsets = computed(() =>
  availableWordsets.value.filter((wordset) => form.wordsetIds.has(wordset.id)),
)

const orderedWordsets = computed(() => {
  const selected = availableWordsets.value.filter((wordset) => form.wordsetIds.has(wordset.id))
  const unselected = availableWordsets.value.filter((wordset) => !form.wordsetIds.has(wordset.id))
  return [...selected, ...unselected]
})

const isSelectionLocked = computed(() => selectedWordsets.value.length >= 4)

function token(): string {
  return auth.token.value!
}

function toggleWordset(id: number) {
  if (form.wordsetIds.has(id)) {
    form.wordsetIds.delete(id)
  } else if (form.wordsetIds.size < 4) {
    form.wordsetIds.add(id)
  }
}

async function loadGamesets() {
  gamesetsLoading.value = true
  errorMessage.value = null
  try {
    gamesets.value = await listGamesets(token())
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : t('admin.gamesets.loadFailed')
  } finally {
    gamesetsLoading.value = false
  }
}

async function loadWordsets() {
  wordsetsLoading.value = true
  try {
    availableWordsets.value = await listWordsets(token())
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : t('admin.gamesets.wordsetLoadFailed')
  } finally {
    wordsetsLoading.value = false
  }
}

async function onCreateGameset() {
  if (selectedWordsets.value.length !== 4) return

  createGamesetLoading.value = true
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
    createGamesetLoading.value = false
  }
}

async function onCreateWordset() {
  const words = parseWordsInput(wordsetForm.wordsRaw)

  if (words.length < 4) {
    errorMessage.value = t('admin.wordsets.minWords')
    return
  }

  createWordsetLoading.value = true
  errorMessage.value = null
  try {
    const createdWordset = await createWordset(token(), {
      category: wordsetForm.category,
      difficulty: wordsetForm.difficulty,
      words,
    })
    availableWordsets.value = [createdWordset, ...availableWordsets.value]
    if (form.wordsetIds.size < 4) {
      form.wordsetIds.add(createdWordset.id)
    }
    wordsetForm.category = ''
    wordsetForm.difficulty = 1
    wordsetForm.wordsRaw = ''
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : t('admin.wordsets.createFailed')
  } finally {
    createWordsetLoading.value = false
  }
}

onMounted(() => {
  void loadGamesets()
  void loadWordsets()
})
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
  display: grid;
  gap: 1rem;
}

.section-heading,
.section-subheading {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: start;
  flex-wrap: wrap;
}

.section-heading h3,
.section-subheading h4 {
  margin: 0;
}

.selection-pill {
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: var(--kz-surface);
  border: 1px solid var(--kz-border);
  font-size: 0.8rem;
  font-weight: 600;
}

.builder-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.panel,
.create-form {
  display: grid;
  gap: 0.75rem;
}

.panel {
  padding: 1rem;
  border-radius: 0.75rem;
  background: var(--kz-surface);
  border: 1px solid var(--kz-border);
  align-content: start;
}

.gameset-form input[type="text"],
.gameset-form input[type="date"],
.quick-wordset-form input[type="text"],
.quick-wordset-form input[type="number"],
.quick-wordset-form > input {
  font: inherit;
  padding: 0.5rem 1rem;
  border: 1px solid var(--kz-border);
  border-radius: 2rem;
  width: 100%;
  min-width: 0;
  background: var(--kz-input-bg);
  color: var(--kz-text);
}

.selected-summary {
  display: grid;
  gap: 0.75rem;
}

.selected-wordsets {
  display: grid;
  gap: 0.75rem;
}

.selected-card {
  display: grid;
  gap: 0.35rem;
  padding: 0.8rem;
  border-radius: 0.65rem;
  background: rgba(22, 163, 74, 0.12);
  border: 1px solid rgba(22, 163, 74, 0.35);
}

.selected-words {
  font-size: 0.85rem;
  overflow-wrap: anywhere;
}

.picker-section {
  display: grid;
  gap: 0.75rem;
}

.wordset-picker {
  display: grid;
  gap: 0.5rem;
  max-height: 20rem;
  overflow-y: auto;
}

.picker-item {
  display: grid;
  grid-template-columns: 1.1rem minmax(0, 1fr);
  gap: 0.25rem 0.65rem;
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

.picker-item.disabled {
  opacity: 0.65;
}

.picker-item input[type="checkbox"] {
  margin-top: 0.15rem;
}

.picker-item strong,
.picker-item .muted {
  min-width: 0;
  overflow-wrap: anywhere;
}

.picker-item .muted {
  grid-column: 2;
  font-size: 0.8rem;
}

.gameset-form button,
.quick-wordset-form button {
  justify-self: start;
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

@media (max-width: 640px) {
  .create-section {
    padding: 0.85rem;
  }

  .builder-grid {
    grid-template-columns: 1fr;
  }

  .gameset-form button,
  .quick-wordset-form button {
    width: 100%;
  }

  .picker-item {
    padding: 0.65rem;
  }

  .picker-item .muted {
    font-size: 0.75rem;
  }
}
</style>
