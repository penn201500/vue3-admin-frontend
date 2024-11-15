import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // State to control header and theme switcher visibility
  const isFloatingHeaderVisible = ref(false)
  const isThemeSwitcherVisible = ref(false)

  // Actions to update the state
  const showFloatingHeader = () => {
    isFloatingHeaderVisible.value = true
  }

  const hideFloatingHeader = () => {
    isFloatingHeaderVisible.value = false
  }

  const showThemeSwitcher = () => {
    isThemeSwitcherVisible.value = true
  }

  const hideThemeSwitcher = () => {
    isThemeSwitcherVisible.value = false
  }

  return {
    isFloatingHeaderVisible,
    isThemeSwitcherVisible,
    showFloatingHeader,
    hideFloatingHeader,
    showThemeSwitcher,
    hideThemeSwitcher,
  }
})
