import { defineStore } from 'pinia'
import { ref } from 'vue'
import { i18n } from '@/i18n'
import { setApiClientLanguage } from '@/utils/apiClient'

export const useLangStore = defineStore('lang', () => {
  const currentLang = ref(localStorage.getItem('language') || 'en')

  const setLanguage = (lang: string) => {
    currentLang.value = lang
    i18n.global.locale.value = lang as 'en' | 'zh-hans'
    localStorage.setItem('language', lang)
    setApiClientLanguage(lang)
    window.location.reload()
  }

  return { currentLang, setLanguage }
})
