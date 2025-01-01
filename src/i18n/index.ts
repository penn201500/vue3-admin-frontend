import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import zhHans from '../locales/zh-hans.json'

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: localStorage.getItem('language') || 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    'zh-hans': zhHans,
  },
})

export default i18n
