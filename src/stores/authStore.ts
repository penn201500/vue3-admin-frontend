// src/stores/authStore.ts
import { defineStore } from 'pinia'
import apiClient from '@/utils/apiClient'
import router from '@/router'
import { handleError } from '@/utils/errorHandler'
import type { User } from '@/types/User'
import { showNotification } from '@/utils/showNotification'
import axios from 'axios'
import type { MenuItem } from '@/types/Tabs'
import { useTabStore } from './tabStore'

// Helper functions for sessionStorage management
function saveMenusToSessionStorage(menus: MenuItem[]) {
  sessionStorage.setItem('userMenus', JSON.stringify(menus))
}

function loadMenusFromSessionStorage(): MenuItem[] {
  try {
    const storedMenus = sessionStorage.getItem('userMenus')
    if (!storedMenus) return []

    const parsedMenus = JSON.parse(storedMenus)
    if (!Array.isArray(parsedMenus)) return []

    // Validate menu structure
    const isValidMenu =
      parsedMenus.length > 0 && parsedMenus.every((menu) => menu?.id && menu?.name && menu?.path)

    return isValidMenu ? parsedMenus : []
  } catch (e) {
    console.error('Error loading menus from sessionStorage:', e)
    return []
  }
}

export const useAuthStore = defineStore('auth', {
  // State Management
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null') as User | null, // Stores user data
    loading: false, // Tracks loading state for operations
    csrfInitialized: false, // Tracks if CSRF token is initialized
    accessToken: null as string | null, // Store access token in memory
    rateLimit: false, // Track rate limiting
    rememberMe: false, // Track if 'remember me' is selected
    userMenus: loadMenusFromSessionStorage() as MenuItem[], // Load menus from sessionStorage
    userRoleIds: [] as number[], // Store user role IDs
  }),

  // Computed Properties
  getters: {
    isLoggedIn: (state) => !!state.user, // Indicates if the user is logged in based on user data
    isAuthenticated: (state) => !!state.user && !!state.accessToken,
    tokenExpiration: (state) => {
      if (!state.accessToken) return 0
      try {
        const payload = JSON.parse(atob(state.accessToken.split('.')[1]))
        return payload.exp * 1000 // Convert to milliseconds
      } catch {
        return 0
      }
    },
    isTokenExpired(): boolean {
      const expiration = this.tokenExpiration
      const currentTime = Date.now()
      return currentTime > expiration
    },
  },

  // Methods
  actions: {
    // User State Management
    setUser(user: User, accessToken: string, rememberMe: boolean) {
      this.user = user
      this.accessToken = accessToken
      this.rememberMe = rememberMe
      this.userRoleIds = user.roles.map((role) => role.id)

      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        sessionStorage.setItem('user', JSON.stringify(user))
      }
    },

    clearAuth() {
      const tabStore = useTabStore()

      this.user = null
      this.accessToken = null
      this.loading = false
      this.rememberMe = false
      this.userMenus = []
      localStorage.removeItem('user')
      sessionStorage.removeItem('user')
      sessionStorage.removeItem('userMenus') // Clear menus

      // Clear tabs and reset to default
      tabStore.clearAllTabs()

      this.rateLimit = false // Reset rate limit flag
    },

    async fetchUserMenus(userId?: number, force: boolean = false) {
      // Check for valid existing menus
      const hasValidMenus =
        this.userMenus.length > 0 &&
        this.userMenus.every((menu) => menu.id && menu.name && menu.path)

      // If menus already exist and not forced, skip fetch
      if (hasValidMenus && !force) {
        console.log('Using cached menus')
        return true
      }

      try {
        console.log('Fetching fresh menus')
        const url = userId ? `/menu/api/users/${userId}/menus/` : '/menu/api/user-menus/'
        const response = await apiClient.get(url)
        if (response.data.code === 200) {
          this.userMenus = response.data.data
          saveMenusToSessionStorage(this.userMenus)
          return true
        }
        return false
      } catch (error) {
        console.error('Failed to fetch user menus:', error)
        return false
      }
    },

    // Authentication Actions
    async login(username: string, password: string, rememberMe: boolean) {
      this.loading = true
      try {
        const response = await apiClient.post('/user/api/login/', {
          username,
          password,
          rememberMe,
        })

        if (response.data.code === 200) {
          const { user, access } = response.data
          this.setUser(user, access, rememberMe)
          await this.fetchUserMenus() // Fetch menus after login
          showNotification('Success', 'Login successful!', 'success')
          router.push('/')
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          handleError(error)
        } else {
          // Handle non-Axios errors
          console.error('An unexpected error occurred:', error)
          showNotification('Error', 'An unexpected error occurred.', 'error')
        }
        throw error // Propagate error for handling in components
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      try {
        const response = await apiClient.post('/user/api/logout/')
        if (response.data.code === 200) {
          showNotification('Success', 'Logged out successfully', 'success')
        } else {
          // Handle cases where refresh token might be invalid or expired
          showNotification('Info', response.data.message || 'You have been logged out.', 'info')
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          handleError(error)
        } else {
          console.error('An unexpected error occurred:', error)
          showNotification('Error', 'An unexpected error occurred.', 'error')
        }
      } finally {
        this.clearAuth() // Clears user state and tabs
        router.push('/login') // Redirects to login page
        this.loading = false
      }
    },

    // Token Management
    async refreshAccessToken() {
      try {
        const response = await apiClient.post(
          '/user/api/token/refresh/',
          {},
          {
            withCredentials: true,
            // Skip the request interceptor for this call to prevent infinite loop
            _retry: true,
            headers: {}, // Ensure headers are set for this request
          },
        )
        if (response.data.code === 200) {
          this.accessToken = response.data.access
          // showNotification('Success', 'Session refreshed', 'success')
          this.rateLimit = false // Reset rate limit flag on success
          return true
        }
        throw new Error('Failed to refresh token')
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 429) {
            // handleError(error)
            // Process rate limiting and notification in response interceptor
            return 'RATE_LIMIT'
          } else if (error.response?.status === 401) {
            // Unauthorized: Refresh token is missing or invalid
            this.clearAuth()
            showNotification('Error', 'Session expired. Please log in again.', 'error')
            router.push('/login')
            return false
          } else {
            handleError(error)
            this.clearAuth()
            // showNotification('Error', 'Session expired. Please log in again.', 'error')
            router.push('/login')
            return false
          }
        } else {
          // Handle non-Axios errors
          console.error('An unexpected error occurred:', error)
          showNotification('Error', 'An unexpected error occurred.', 'error')
          this.clearAuth()
          router.push('/login')
          return false
        }
      }
    },

    // User Information
    async fetchUserInfo() {
      try {
        const response = await apiClient.get('/user/api/user-info/')
        if (response.data.code === 200) {
          this.setUser(response.data.data, this.accessToken as string, this.rememberMe)
          this.rateLimit = false // Reset rate limit flag on success
          return true
        }
        return false
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response && error.response.status === 429) {
            // handleError(error)
            // Process rate limiting and notification in response interceptor
            return false
          } else {
            handleError(error)
            this.clearAuth()
            return false
          }
        } else {
          // Handle non-Axios errors
          console.error('An unexpected error occurred:', error)
          showNotification('Error', 'An unexpected error occurred.', 'error')
          this.clearAuth()
          return false
        }
      }
    },

    // Initialization
    async initializeStore() {
      // Attempt to load user from localStorage or sessionStorage based on 'rememberMe'
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user')
      if (!storedUser) {
        this.clearAuth()
        router.push('/login')
      } else {
        this.user = JSON.parse(storedUser) as User
      }

      if (this.isLoggedIn) {
        if (!this.csrfInitialized) {
          try {
            await apiClient.get('/user/api/csrf/')
            this.csrfInitialized = true
          } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
              console.error('Failed to initialize CSRF:', error)
              handleError(error)
            } else {
              console.error('An unexpected error occurred:', error)
              showNotification('Error', 'An unexpected error occurred.', 'error')
            }
          }
        }
        if (this.isTokenExpired) {
          const refreshed = await this.refreshAccessToken()
          if (refreshed === true) {
            await this.fetchUserInfo()
          } else if (refreshed === 'RATE_LIMIT') {
            // Do not clear auth; allow user to stay logged in
            showNotification(
              'Warning',
              'Session refresh rate limit reached. Please try again later.',
              'warning',
            )
          } else {
            this.clearAuth()
            router.push('/login')
          }
        } else {
          await this.fetchUserInfo()
        }
      }
    },
  },
})
