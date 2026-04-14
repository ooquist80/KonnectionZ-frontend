import { ref } from 'vue'

interface WakeLockSentinelLike extends EventTarget {
  release: () => Promise<void>
}

interface WakeLockApiLike {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinelLike>
  }
}

const isEnabled = ref(false)
const isActive = ref(false)
const isSupported = ref(typeof navigator !== 'undefined' && 'wakeLock' in navigator)

let sentinel: WakeLockSentinelLike | null = null
let inGameplay = false
let listenersBound = false

function getWakeLockApi() {
  return (navigator as WakeLockApiLike).wakeLock
}

function bindListeners() {
  if (listenersBound || typeof document === 'undefined') {
    return
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && inGameplay && isEnabled.value && !sentinel) {
      void requestWakeLock()
    }
  })

  listenersBound = true
}

function clearSentinel() {
  sentinel = null
  isActive.value = false
}

async function requestWakeLock() {
  const wakeLock = getWakeLockApi()
  if (!wakeLock) {
    isSupported.value = false
    clearSentinel()
    return
  }

  if (!inGameplay) {
    return
  }

  if (sentinel) {
    return
  }

  try {
    sentinel = await wakeLock.request('screen')
    isActive.value = true
    sentinel.addEventListener('release', () => {
      clearSentinel()
      if (inGameplay && isEnabled.value && document.visibilityState === 'visible') {
        void requestWakeLock()
      }
    }, { once: true })
  } catch {
    clearSentinel()
    isEnabled.value = false
  }
}

async function releaseWakeLock() {
  const activeSentinel = sentinel
  clearSentinel()

  if (activeSentinel) {
    await activeSentinel.release()
  }
}

export function useWakeLockStore() {
  bindListeners()

  async function setEnabled(enabled: boolean) {
    isEnabled.value = enabled

    if (!enabled) {
      await releaseWakeLock()
      return
    }

    await requestWakeLock()
  }

  async function toggle() {
    await setEnabled(!isEnabled.value)
  }

  async function syncGameplayState(active: boolean) {
    inGameplay = active

    if (!active) {
      await releaseWakeLock()
      return
    }

    if (isEnabled.value) {
      await requestWakeLock()
    }
  }

  return {
    isEnabled,
    isActive,
    isSupported,
    setEnabled,
    toggle,
    syncGameplayState,
  }
}
