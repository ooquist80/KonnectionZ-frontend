import { ref, computed, watch } from 'vue'

export interface BackgroundTheme {
  id: string
  label: string
  gradient: string
  hueStart: number
  hueRange: number
  saturation: number
  dotLightness: number
  isLight: boolean
  preview: [string, string]
}

const themes: BackgroundTheme[] = [
  {
    id: 'ocean',
    label: 'Ocean',
    gradient: 'linear-gradient(135deg, #0f2027, #2c5364)',
    hueStart: 180,
    hueRange: 60,
    saturation: 100,
    dotLightness: 70,
    isLight: false,
    preview: ['#0f2027', '#2c5364'],
  },
  {
    id: 'aurora',
    label: 'Aurora',
    gradient: 'linear-gradient(135deg, #0f0c29, #24243e)',
    hueStart: 260,
    hueRange: 60,
    saturation: 100,
    dotLightness: 70,
    isLight: false,
    preview: ['#0f0c29', '#24243e'],
  },
  {
    id: 'sunset',
    label: 'Sunset',
    gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    hueStart: 10,
    hueRange: 40,
    saturation: 100,
    dotLightness: 70,
    isLight: false,
    preview: ['#1a1a2e', '#16213e'],
  },
  {
    id: 'forest',
    label: 'Forest',
    gradient: 'linear-gradient(135deg, #0b1a0b, #1b4332)',
    hueStart: 100,
    hueRange: 50,
    saturation: 100,
    dotLightness: 70,
    isLight: false,
    preview: ['#0b1a0b', '#1b4332'],
  },
  {
    id: 'ember',
    label: 'Ember',
    gradient: 'linear-gradient(135deg, #1a0000, #4a1a2e)',
    hueStart: 340,
    hueRange: 40,
    saturation: 100,
    dotLightness: 70,
    isLight: false,
    preview: ['#1a0000', '#4a1a2e'],
  },
  {
    id: 'cosmos',
    label: 'Cosmos',
    gradient: 'linear-gradient(135deg, #0d0221, #261447)',
    hueStart: 280,
    hueRange: 80,
    saturation: 100,
    dotLightness: 70,
    isLight: false,
    preview: ['#0d0221', '#261447'],
  },
  {
    id: 'dark',
    label: 'Dark',
    gradient: 'linear-gradient(135deg, #111111, #2a2a2a)',
    hueStart: 0,
    hueRange: 0,
    saturation: 0,
    dotLightness: 75,
    isLight: false,
    preview: ['#111111', '#2a2a2a'],
  },
  {
    id: 'light',
    label: 'Light',
    gradient: 'linear-gradient(135deg, #e5e7eb, #f9fafb)',
    hueStart: 0,
    hueRange: 0,
    saturation: 0,
    dotLightness: 35,
    isLight: true,
    preview: ['#e5e7eb', '#f9fafb'],
  },
]

const darkCssVars: Record<string, string> = {
  '--kz-text': '#f3f4f6',
  '--kz-text-muted': '#c9cdd3',
  '--kz-text-faint': '#9ca3af',
  '--kz-link': '#60a5fa',
  '--kz-border': 'rgba(255, 255, 255, 0.15)',
  '--kz-surface': 'rgba(255, 255, 255, 0.12)',
  '--kz-surface-hover': 'rgba(255, 255, 255, 0.18)',
  '--kz-surface-raised': 'rgba(30, 41, 59, 0.95)',
  '--kz-glass': 'rgba(255, 255, 255, 0.1)',
  '--kz-glass-strong': 'rgba(255, 255, 255, 0.15)',
  '--kz-input-bg': 'rgba(255, 255, 255, 0.08)',
  '--kz-input-border': 'rgba(255, 255, 255, 0.2)',
  '--kz-btn-bg': 'rgba(255, 255, 255, 0.1)',
  '--kz-btn-border': 'rgba(255, 255, 255, 0.2)',
  '--kz-btn-text': '#f3f4f6',
  '--kz-btn-hover': 'rgba(255, 255, 255, 0.18)',
}

const lightCssVars: Record<string, string> = {
  '--kz-text': '#111827',
  '--kz-text-muted': '#4b5563',
  '--kz-text-faint': '#6b7280',
  '--kz-link': '#2563eb',
  '--kz-border': 'rgba(0, 0, 0, 0.12)',
  '--kz-surface': 'rgba(255, 255, 255, 0.75)',
  '--kz-surface-hover': 'rgba(255, 255, 255, 0.88)',
  '--kz-surface-raised': 'rgba(255, 255, 255, 0.95)',
  '--kz-glass': 'rgba(255, 255, 255, 0.5)',
  '--kz-glass-strong': 'rgba(255, 255, 255, 0.6)',
  '--kz-input-bg': 'rgba(255, 255, 255, 0.8)',
  '--kz-input-border': 'rgba(0, 0, 0, 0.15)',
  '--kz-btn-bg': 'rgba(255, 255, 255, 0.65)',
  '--kz-btn-border': 'rgba(0, 0, 0, 0.12)',
  '--kz-btn-text': '#1f2937',
  '--kz-btn-hover': 'rgba(255, 255, 255, 0.8)',
}

export function getThemeCssVars(isLight: boolean): Record<string, string> {
  return isLight ? lightCssVars : darkCssVars
}

const STORAGE_KEY = 'konnectionz.bgTheme'
const DEFAULT_THEME = 'ocean'

function loadThemeId(): string {
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME
}

const activeThemeId = ref(loadThemeId())

watch(activeThemeId, (id) => {
  localStorage.setItem(STORAGE_KEY, id)
})

export function useThemeStore() {
  const activeTheme = computed(
    () => themes.find((t) => t.id === activeThemeId.value) ?? themes[0],
  )

  function setTheme(id: string) {
    if (themes.some((t) => t.id === id)) {
      activeThemeId.value = id
    }
  }

  return {
    themes,
    activeThemeId,
    activeTheme,
    setTheme,
  }
}
