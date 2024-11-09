// src/stores/authStore.ts
import { defineStore } from 'pinia'
import apiClient from '@/utils/apiClient'
import { ElNotification } from 'element-plus'
import router from '@/router'
import { AxiosError } from 'axios'

export const useAuthStore = defineStore('auth', {
  // State Management
  state: () => ({
    user: null as User | null, // Stores user data
    loading: false, // Tracks loading state for operations
    csrfInitialized: false, // Tracks if CSRF token is initialized
  }),

  // Computed Properties
  getters: {
    isAuthenticated: (state) => !!state.user, // Checks if user is authenticated
  },

  // Methods
  actions: {
    // User State Management
    setUser(user: User) {
      this.user = user
    },

    clearAuth() {
      this.user = null
      this.loading = false
    },

    // Notification Helper
    showNotification(title: string, message: string, type: 'success' | 'error' | 'info') {
      ElNotification({
        title,
        message,
        type,
        duration: 1000,
      })
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
          this.setUser(response.data.user)
          this.showNotification('Success', 'Login successful!', 'success')
          router.push('/')
        }
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ErrorResponseData>
        const message = axiosError.response?.data?.message || 'Login failed. Please try again.'
        this.showNotification('Error', message, 'error')
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
          this.showNotification('Success', 'Logged out successfully', 'info')
        } else {
          // Handle cases where refresh token might be invalid or expired
          this.showNotification(
            'Info',
            response.data.message || 'You have been logged out.',
            'info',
          )
        }
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ErrorResponseData>
        const message = axiosError.response?.data?.message || 'Logout failed. Please try again.'
        this.showNotification('Error', message, 'error')
      } finally {
        this.clearAuth() // Clears user state
        router.push('/login') // Redirects to login page
      }
    },

    // Token Management
    async refreshAccessToken() {
      try {
        const response = await apiClient.post('/user/api/token/refresh/')
        if (response.data.code === 200) {
          await this.fetchUserInfo()
          return true
        }
        return false
      } catch (error) {
        console.error('Token refresh failed:', error)
        this.clearAuth()
        return false
      }
    },

    // User Information
    async fetchUserInfo() {
      try {
        const response = await apiClient.get('/user/api/user-info/')
        if (response.data.code === 200) {
          this.setUser(response.data.data)
          return true
        }
        return false
      } catch (error) {
        console.error('Failed to fetch user info:', error)
        this.clearAuth()
        return false
      }
    },

    // Initialization
    async initializeStore() {
      if (!this.csrfInitialized) {
        try {
          await apiClient.get('/user/api/csrf/')
          this.csrfInitialized = true
        } catch (error) {
          console.error('Failed to initialize CSRF:', error)
        }
      }

      // Only fetch user info if the user is authenticated
      if (this.isAuthenticated) {
        await this.fetchUserInfo()
      }
    },
  },
})

// Types
interface User {
  id: number
  username: string
  email: string
}

interface ErrorResponseData {
  message?: string
  code?: number
}
