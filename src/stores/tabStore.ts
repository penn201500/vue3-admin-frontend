import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MenuItem, TabItem } from '@/types/Tabs'

export const useTabStore = defineStore('tab', () => {
  const tabs = ref<TabItem[]>([
    {
      id: 'dashboard',
      title: 'Dashboard',
      path: '/',
      component: 'HomeView',
      closeable: false,
      isDefault: true,
    },
  ])
  const activeTabId = ref('dashboard')
  const showDefaultTab = ref(true)

  // Add new tab
  const addTab = (menuItem: MenuItem) => {
    const tabId = menuItem.path
    const existingTab = tabs.value.find((tab) => tab.id === tabId)

    if (existingTab) {
      activeTabId.value = tabId
      return
    }

    const newTab: TabItem = {
      id: tabId,
      title: menuItem.name,
      path: menuItem.path,
      component: menuItem.component || '', // Add default empty string
      icon: menuItem.icon,
      closeable: true,
    }

    tabs.value.push(newTab)
    activeTabId.value = tabId
  }

  // Remove tab
  const removeTab = (tabId: string) => {
    const tabIndex = tabs.value.findIndex((tab) => tab.id === tabId)
    if (tabIndex === -1) return

    // If closing active tab, switch to another tab
    if (activeTabId.value === tabId) {
      const nextTab = tabs.value[tabIndex - 1] || tabs.value[tabIndex + 1]
      activeTabId.value = nextTab?.id || 'dashboard'
    }

    tabs.value = tabs.value.filter((tab) => tab.id !== tabId)
  }

  // Set active tab
  const setActiveTab = (tabId: string) => {
    activeTabId.value = tabId
  }

  // Toggle default tab visibility
  const toggleDefaultTab = (show: boolean) => {
    showDefaultTab.value = show
  }

  return {
    tabs,
    activeTabId,
    showDefaultTab,
    addTab,
    removeTab,
    setActiveTab,
    toggleDefaultTab,
  }
})
