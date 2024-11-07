import axios from 'axios'
import { i18n } from '@/i18n'
import { watch } from 'vue'

const backendURL = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:8000'

// Create an Axios instance
const apiClient = axios.create({
  baseURL: '', // We'll set this dynamically
  headers: {
    'Content-Type': 'application/json',
  },
})

// Function to set the baseURL with the current language prefix
export const setApiClientLanguage = (language: string) => {
  apiClient.defaults.baseURL = `${backendURL}/${language}/` // Replace with your backend URL
}

// Initialize the baseURL with the default language
setApiClientLanguage(i18n.global.locale.value)

// Watch for language changes and update the baseURL accordingly
watch(i18n.global.locale, (newLocale: string) => {
  setApiClientLanguage(newLocale)
})

export default apiClient
