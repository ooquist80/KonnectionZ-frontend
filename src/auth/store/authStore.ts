import { computed, ref } from 'vue'
import type { UserRead } from '../../shared/types/api'
import { clearStoredToken, getStoredToken, setStoredToken } from '../../shared/auth/tokenStorage'
import { getMe, login } from '../../shared/api/authApi'

const token = ref<string | null>(getStoredToken())
const user = ref<UserRead | null>(null)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

async function loadCurrentUser(): Promise<void> {
  if (!token.value) {
    user.value = null
    return
  }

  user.value = await getMe(token.value)
}

export function useAuthStore() {
  const isAuthenticated = computed(() => Boolean(token.value && user.value))

  async function loginWithPassword(username: string, password: string): Promise<void> {
    isLoading.value = true
    errorMessage.value = null

    try {
      const accessToken = await login({ username, password })
      token.value = accessToken
      setStoredToken(accessToken)
      await loadCurrentUser()
    } catch (error) {
      clearStoredToken()
      token.value = null
      user.value = null
      errorMessage.value = error instanceof Error ? error.message : 'Unable to sign in'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  function logout(): void {
    clearStoredToken()
    token.value = null
    user.value = null
    errorMessage.value = null
  }

  async function restoreSession(): Promise<void> {
    if (!token.value) {
      return
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      await loadCurrentUser()
    } catch (error) {
      logout()
      errorMessage.value = error instanceof Error ? error.message : 'Session restore failed'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    token,
    user,
    isLoading,
    isAuthenticated,
    errorMessage,
    loginWithPassword,
    logout,
    restoreSession,
  }
}
