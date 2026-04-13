import { createI18n } from 'vue-i18n'
import en from './en.json'
import sv from './sv.json'

const STORAGE_KEY = 'konnectionz.locale'

function getStoredLocale(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? 'sv'
  } catch {
    return 'sv'
  }
}

const i18n = createI18n({
  legacy: false,
  locale: getStoredLocale(),
  fallbackLocale: 'en',
  messages: { en, sv },
})

export function setLocale(locale: 'en' | 'sv') {
  i18n.global.locale.value = locale
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // localStorage unavailable
  }
}

export default i18n
