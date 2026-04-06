import { computed, ref } from 'vue'
import type { PlayGameSet, PlayResult } from '../../shared/types/api'
import { createDailyGame, createGame, listGamesets, playWords } from '../../shared/api/playApi'
import { useAuthStore } from '../../auth/store/authStore'

const currentResult = ref<PlayResult | null>(null)
const gameSets = ref<PlayGameSet[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const resultMessageOverride = ref<string | null | undefined>(undefined)
const gameName = ref<string | null>(null)

function applyGameStart(result: PlayResult) {
  currentResult.value = result
  gameName.value = result.game_status.game_name
}

export function useGameStore() {
  const auth = useAuthStore()

  const wordsRemaining = computed(() => currentResult.value?.game_status.words_remaining ?? [])
  const completedGroups = computed(() => currentResult.value?.game_status.wordsets_completed ?? [])
  const missCount = computed(() => currentResult.value?.game_status.miss_count ?? 0)
  const resultMessage = computed(() =>
    resultMessageOverride.value !== undefined
      ? resultMessageOverride.value
      : (currentResult.value?.result_message ?? null),
  )

  function requireToken(): string {
    const token = auth.token.value
    if (!token) throw new Error('Authentication is required for gameplay')
    return token
  }

  async function startDailyGame(): Promise<void> {
    isLoading.value = true
    errorMessage.value = null
    try {
      applyGameStart(await createDailyGame(requireToken()))
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Failed to create daily game'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function loadGameSets(): Promise<void> {
    isLoading.value = true
    errorMessage.value = null
    try {
      gameSets.value = await listGamesets(requireToken())
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Failed to load gamesets'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function startGame(gamesetId: number): Promise<void> {
    isLoading.value = true
    errorMessage.value = null
    try {
      applyGameStart(await createGame(requireToken(), gamesetId))
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Failed to create game'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function submitWords(words: string[]): Promise<void> {
    if (!currentResult.value) throw new Error('No active game to play')

    isLoading.value = true
    errorMessage.value = null
    resultMessageOverride.value = null

    try {
      currentResult.value = await playWords(requireToken(), currentResult.value.game_id, words)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Failed to submit words'
      throw error
    } finally {
      resultMessageOverride.value = undefined
      isLoading.value = false
    }
  }

  return {
    currentResult,
    gameSets,
    gameName,
    wordsRemaining,
    completedGroups,
    missCount,
    resultMessage,
    isLoading,
    errorMessage,
    startDailyGame,
    loadGameSets,
    startGame,
    submitWords,
  }
}
