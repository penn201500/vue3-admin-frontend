import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // State to control header visibility
  const isHeaderVisible = ref(false)

  // Actions to update the state
  const showHeader = () => {
    isHeaderVisible.value = true
  }

  const hideHeader = () => {
    isHeaderVisible.value = false
  }

  return {
    isHeaderVisible,
    showHeader,
    hideHeader,
  }
})
