// src/stores/authStore.ts
import { defineStore } from 'pinia'
import apiClient from '@/utils/apiClient'
import router from '@/router'
import { handleError } from '@/utils/errorHandler'
import type { User } from '@/types/User'
import { showNotification } from '@/utils/showNotification'

export const useAuthStore = defineStore('auth', {
  // State Management
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null') as User | null, // Stores user data
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
      localStorage.setItem('user', JSON.stringify(user))
    },

    clearAuth() {
      this.user = null
      this.loading = false
      localStorage.removeItem('user')
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
          showNotification('Success', 'Login successful!', 'success')
          router.push('/')
        }
      } catch (error: unknown) {
        handleError(error)
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
        handleError(error)
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
        handleError(error)
        this.clearAuth()
        router.push('/login')
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
        handleError(error)
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
