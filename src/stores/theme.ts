import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const isDarkMode = ref(false)

  // Initialize theme based on localStorage
  const initializeTheme = () => {
    if (localStorage.getItem('theme') === 'dark') {
      isDarkMode.value = true
      document.documentElement.classList.add('dark')
    } else {
      isDarkMode.value = false
      document.documentElement.classList.remove('dark')
    }
  }

  watch(isDarkMode, (newVal) => {
    if (newVal) {
      localStorage.setItem('theme', 'dark')
      document.documentElement.classList.add('dark')
    } else {
      localStorage.setItem('theme', 'light')
      document.documentElement.classList.remove('dark')
    }
  })

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
  }

  return { isDarkMode, initializeTheme, toggleDarkMode }
})
