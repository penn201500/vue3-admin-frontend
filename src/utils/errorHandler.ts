import { showNotification } from './showNotification'
import { AxiosError } from 'axios'
import type { CustomError } from '@/types/CustomError'

/**
 * Centralized Error Handler
 * Processes errors based on their type and performs corresponding actions.
 * @param error - The error object containing status, type, and message.
 */
export function handleError(error: unknown) {
  const axiosError = error as AxiosError<CustomError>
  if (axiosError.response) {
    const { status, data } = axiosError.response
    switch (status) {
      case 429:
        showNotification('Rate Limit Exceeded', data.message || '', 'error')
        break
      // Uncomment and adjust these cases as needed
      // case 'forbidden':
      // this.showNotification('Forbidden', message, 'error')
      // this.clearAuth()
      // router.push('/login')
      // break
      // case 'server_error':
      // this.showNotification('Server Error', message, 'error')
      // break
      default:
        showNotification('Error', data.message || 'An error occurred', 'error')
    }
  } else {
    // Handle errors without status (e.g., network errors)
    showNotification('Error', 'An unexpected error occurred.', 'error')
  }
}
