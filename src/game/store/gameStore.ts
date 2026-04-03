import { computed, ref } from 'vue'
import type { PlayGameSet, PlayResult } from '../../shared/types/api'
import { createDailyGame, createGame, listGamesets, playWords } from '../../shared/api/playApi'
import { useAuthStore } from '../../auth/store/authStore'

const currentResult = ref<PlayResult | null>(null)
const gameSets = ref<PlayGameSet[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

export function useGameStore() {
  const auth = useAuthStore()

  const gameName = computed(() => currentResult.value?.game_status.game_name ?? null)
  const wordsRemaining = computed(() => currentResult.value?.game_status.words_remaining ?? [])
  const completedGroups = computed(() => currentResult.value?.game_status.wordsets_completed ?? [])
  const resultMessage = computed(() => currentResult.value?.result_message ?? null)

  function requireToken(): string {
    const token = auth.token.value
    if (!token) {
      throw new Error('Authentication is required for gameplay')
    }
    return token
  }

  async function startDailyGame(): Promise<void> {
    isLoading.value = true
    errorMessage.value = null

    try {
      currentResult.value = await createDailyGame(requireToken())
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
      currentResult.value = await createGame(requireToken(), gamesetId)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Failed to create game'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function submitWords(words: string[]): Promise<void> {
    if (!currentResult.value) {
      throw new Error('No active game to play')
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      currentResult.value = await playWords(requireToken(), currentResult.value.game_id, words)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Failed to submit words'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    currentResult,
    gameSets,
    gameName,
    wordsRemaining,
    completedGroups,
    resultMessage,
    isLoading,
    errorMessage,
    startDailyGame,
    loadGameSets,
    startGame,
    submitWords,
  }
}
