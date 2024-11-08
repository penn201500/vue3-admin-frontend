// src/stores/authStore.ts

import { defineStore } from 'pinia'
import apiClient from '@/utils/apiClient'
import { ElNotification } from 'element-plus'
import router from '@/router'
import { AxiosError } from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: false,
    loggedOut: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    setUser(user: User) {
      this.user = user
      this.loggedOut = false
    },
    clearAuth() {
      this.user = null
    },
    /**
     * Handles user login.
     * @param username - User's username.
     * @param password - User's password.
     * @param rememberMe - Whether to remember the user across sessions.
     */
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

          ElNotification({
            title: 'Success',
            message: 'Login successful!',
            type: 'success',
          })

          router.push('/')
        }
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ErrorResponseData>
        console.error('Login error:', error)
        const message = axiosError.response?.data?.message || 'Login failed. Please try again.'
        ElNotification({
          title: 'Error',
          message: message,
          type: 'error',
        })
      } finally {
        this.loading = false
      }
    },
    /**
     * Handles user logout.
     */
    async logout() {
      try {
        await apiClient.post('/user/api/logout/')
        ElNotification({
          title: 'Logged Out',
          message: 'You have been successfully logged out.',
          type: 'info',
        })
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ErrorResponseData>
        console.error('Logout error:', error)
        const message = axiosError.response?.data?.message || 'Logout failed. Please try again.'
        ElNotification({
          title: 'Error',
          message: message,
          type: 'error',
        })
      } finally {
        this.clearAuth()
        this.loggedOut = true
        this.loading = false
        router.push('/login')
      }
    },
    /**
     * Fetches authenticated user's information.
     */
    async fetchUserInfo() {
      try {
        const response = await apiClient.get('/user/api/user-info/')
        if (response.data.code === 200) {
          this.setUser(response.data.data)
        } else {
          this.clearAuth()
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error)
        this.clearAuth()
      }
    },
    /**
     * Refreshes the access token using the refresh token.
     * @returns {boolean} - Indicates if the refresh was successful.
     */
    async refreshAccessToken() {
      try {
        const response = await apiClient.post('/user/api/token/refresh/')
        if (response.data.code === 200) {
          // Optionally update user data if returned
          if (response.data.user) {
            this.setUser(response.data.user)
          }
          return true
        }
        this.clearAuth()
        return false
      } catch (error) {
        console.error('Token refresh failed:', error)
        this.clearAuth()
        return false
      }
    },
    /**
     * Initializes the store by fetching user info.
     */
    async initializeStore() {
      if (this.loggedOut) {
        return
      }
      await this.fetchUserInfo()
    },
  },
})

interface User {
  id: number
  username: string
  email: string
}

interface ErrorResponseData {
  message?: string
}
