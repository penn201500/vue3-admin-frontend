import axios, { type AxiosRequestConfig } from 'axios'
import { i18n } from '@/i18n'
import { watch } from 'vue'
import { getActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'

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

let isRefreshing = false
let failedQueue: {
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
  config: AxiosRequestConfig
}[] = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error)
    } else {
      request.config.headers = request.config.headers || {}
      request.config.headers['Authorization'] = `Bearer ${token}`
      request.resolve(apiClient(request.config))
    }
  })
  failedQueue = []
}

// Add a request interceptor to include CSRF token
apiClient.interceptors.request.use(
  (config) => {
    // Skip adding auth header for token refresh requests
    if (config._retry) {
      return config
    }

    // Include CSRF token only for state-changing methods
    if (['post', 'put', 'delete', 'patch'].includes(config.method || '')) {
      const csrfToken = getCSRFToken()
      if (csrfToken) {
        config.headers = config.headers || {}
        config.headers['X-CSRFToken'] = csrfToken
      }
    }

    // Include Authorization header if accessToken is available
    const pinia = getActivePinia()
    const authStore = useAuthStore(pinia)
    if (authStore.accessToken) {
      config.headers = config.headers || {}
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
  async (error) => {
    const originalRequest = error.config
    const pinia = getActivePinia()
    const authStore = useAuthStore(pinia)

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If token refresh is in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
            config: originalRequest,
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshed = await authStore.refreshAccessToken()
        if (refreshed === true) {
          originalRequest.headers = originalRequest.headers || {}
          // Update the authorization header
          originalRequest.headers['Authorization'] = `Bearer ${authStore.accessToken}`
          // Process other queued requests
          processQueue(null, authStore.accessToken)
          return apiClient(originalRequest)
        } else if (refreshed === 'RATE_LIMIT') {
          const error = new Error('Rate limit reached')
          processQueue(error)
          return Promise.reject(error)
        } else {
          processQueue(new Error('Failed to refresh token'))
          return Promise.reject(error)
        }
      } catch (refreshError) {
        processQueue(refreshError as Error)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      authStore.rateLimit = true
    }

    return Promise.reject(error)
  },
)

export default apiClient
