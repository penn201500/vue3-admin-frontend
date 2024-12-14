import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TabItem } from '@/types/Tabs'

export const useTabStore = defineStore('tab', () => {
  const tabs = ref<TabItem[]>([
    {
      id: 'dashboard',
      title: 'Dashboard',
      path: '/',
      component: 'dashboard',
      closeable: false,
      isDefault: true,
    },
  ])

  const activeTabId = ref('dashboard')
  const showDefaultTab = ref(true)

  const addTab = (tab: TabItem) => {
    const exists = tabs.value.some((t) => t.id === tab.id)
    if (!exists) {
      tabs.value.push(tab)
    }
    activeTabId.value = tab.id
  }

  const removeTab = (tabId: string) => {
    const index = tabs.value.findIndex((tab) => tab.id === tabId)
    if (index !== -1) {
      tabs.value.splice(index, 1)
      if (activeTabId.value === tabId) {
        // Set active tab to the previous tab or the first available tab
        if (index > 0) {
          activeTabId.value = tabs.value[index - 1].id
        } else if (tabs.value.length > 0) {
          activeTabId.value = tabs.value[0].id
        }
      }
    }
  }

  const setActiveTab = (tabId: string) => {
    activeTabId.value = tabId
  }

  return {
    tabs,
    activeTabId,
    showDefaultTab,
    addTab,
    removeTab,
    setActiveTab,
  }
})
