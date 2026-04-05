import { computed, ref } from 'vue'
import type { UserRead, UserWrite } from '../../shared/types/api'
import { clearStoredToken, getStoredToken, setStoredToken } from '../../shared/auth/tokenStorage'
import { getMe, login, updateMe } from '../../shared/api/authApi'

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

  async function updateProfile(
    fields: Pick<UserWrite, 'username' | 'email'>,
  ): Promise<void> {
    if (!token.value) throw new Error('Not authenticated')
    await updateMe(token.value, { ...fields, password: '' }, false)
    await loadCurrentUser()
  }

  async function changePassword(
    username: string,
    email: string,
    newPassword: string,
  ): Promise<void> {
    if (!token.value) throw new Error('Not authenticated')
    await updateMe(token.value, { username, email, password: newPassword }, true)
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
    updateProfile,
    changePassword,
  }
}
