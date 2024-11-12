import axios from 'axios'
import { i18n } from '@/i18n'
import { watch } from 'vue'
import { getActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { showNotification } from './showNotification'

const backendURL = import.meta.env.VITE_APP_BACKEND_URL || 'https://localhost:8000'

// Create an Axios instance
const apiClient = axios.create({
  baseURL: `${backendURL}/${i18n.global.locale.value}/`, // Initialize with default language
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
})

// Function to set the baseURL with the current language prefix
export const setApiClientLanguage = (language: string) => {
  apiClient.defaults.baseURL = `${backendURL}/${language}/` // Replace with your backend URL
}

// Initialize the baseURL with the default language
setApiClientLanguage(i18n.global.locale.value)

// Watch for language changes and update the baseURL accordingly
watch(
  () => i18n.global.locale.value,
  (newLocale: string) => {
    setApiClientLanguage(newLocale)
  },
)

// Function to get CSRF token from cookies
function getCSRFToken() {
  const name = 'csrftoken'
  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='))
    ?.split('=')[1]
  return cookieValue
}

// Add a request interceptor to include CSRF token
apiClient.interceptors.request.use(
  (config) => {
    // Include CSRF token only for state-changing methods
    if (['post', 'put', 'delete', 'patch'].includes(config.method || '')) {
      const csrfToken = getCSRFToken()
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken
      }
    }

    // Include Authorization header if accessToken is available
    const pinia = getActivePinia()
    const authStore = useAuthStore(pinia)
    if (authStore.accessToken) {
      config.headers['Authorization'] = `Bearer ${authStore.accessToken}`
    }

    return config
  },
  (error) => {
    console.error('Axios request interceptor error:', error)
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle 429 errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Reset rateLimit flag on successful responses
    const pinia = getActivePinia()
    const authStore = useAuthStore(pinia)
    if (authStore.rateLimit) {
      authStore.rateLimit = false
    }
    return response
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 429) {
        // Access the authStore to set the rateLimit flag
        const pinia = getActivePinia()
        const authStore = useAuthStore(pinia)
        // Set the rateLimit flag
        authStore.rateLimit = true
        // Show rate limit notification
        showNotification(
          'Rate Limit Exceeded',
          'You have made too many requests. Please try again later.',
          'warning',
        )
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
