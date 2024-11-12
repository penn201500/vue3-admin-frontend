// src/utils/errorHandler.ts

import { showNotification } from './showNotification'
import axios from 'axios'

/**
 * Centralized Error Handler
 * Processes errors based on their type and performs corresponding actions.
 * @param error - The error object containing status, type, and message.
 */
export function handleError(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 400:
          showNotification('Bad Request', data.message || 'Bad request.', 'error')
          break
        case 401:
          showNotification('Unauthorized', data.message || 'Unauthorized access.', 'error')
          break
        case 403:
          showNotification('Forbidden', data.message || 'You do not have permission.', 'error')
        //   // Optionally, clear authentication and redirect
        //   // clearAuth()
        //   // router.push('/login')
        //   break
        // case 404:
        //   showNotification('Not Found', data.message || 'Resource not found.', 'error')
        //   break
        case 429:
          showNotification('Rate Limit Exceeded', data.message || 'Too many requests. Please try again later.', 'error')
          break
        // case 500:
        //   showNotification('Server Error', data.message || 'Internal server error.', 'error')
        //   break
        // // Add more cases as needed
        default:
          showNotification('Error', data.message || 'An unexpected error occurred.', 'error')
      }
    } else if (error.request) {
      // Request was made but no response received
      showNotification('Network Error', 'No response received from the server.', 'error')
    } else {
      // Something happened in setting up the request
      showNotification('Error', error.message || 'An unexpected error occurred.', 'error')
    }
  } else if (error instanceof Error) {
    // Handle generic JavaScript errors
    showNotification('Error', error.message, 'error')
  } else {
    // Handle unknown errors
    showNotification('Error', 'An unexpected error occurred.', 'error')
  }
}
