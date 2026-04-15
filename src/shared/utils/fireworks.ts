import confetti from 'canvas-confetti'

const FIREWORK_OPTIONS = {
  spread: 70,
  startVelocity: 42,
  ticks: 180,
  gravity: 1.05,
  zIndex: 2000,
}

export function launchCompletionFireworks() {
  if (typeof window === 'undefined') {
    return
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  confetti({
    ...FIREWORK_OPTIONS,
    particleCount: 70,
    angle: 60,
    origin: { x: 0.08, y: 0.78 },
  })

  confetti({
    ...FIREWORK_OPTIONS,
    particleCount: 70,
    angle: 120,
    origin: { x: 0.92, y: 0.78 },
  })

  window.setTimeout(() => {
    confetti({
      ...FIREWORK_OPTIONS,
      particleCount: 90,
      spread: 90,
      origin: { x: 0.5, y: 0.24 },
    })
  }, 180)
}
