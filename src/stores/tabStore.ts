import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TabItem } from '@/types/Tabs'

// Helper functions for session storage
function saveTabsToSessionStorage(tabs: TabItem[]) {
  sessionStorage.setItem('tabs', JSON.stringify(tabs))
}

function loadTabsFromSessionStorage(): TabItem[] {
  const storedTabs = sessionStorage.getItem('tabs')
  if (!storedTabs) {
    return [
      {
        id: 'dashboard',
        title: 'Dashboard',
        path: '/',
        component: 'dashboard',
        closeable: false,
        isDefault: true,
      },
    ]
  }
  return JSON.parse(storedTabs)
}

export const useTabStore = defineStore('tab', () => {
  const tabs = ref<TabItem[]>(loadTabsFromSessionStorage())
  const activeTabId = ref(sessionStorage.getItem('trackActiveTab') || 'dashboard')
  const showDefaultTab = ref(true)

  const addTab = (tab: TabItem) => {
    const exists = tabs.value.some((t) => t.id === tab.id)
    if (!exists) {
      tabs.value.push(tab)
      saveTabsToSessionStorage(tabs.value)
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
      saveTabsToSessionStorage(tabs.value)
    }
  }

  const setActiveTab = (tabId: string) => {
    activeTabId.value = tabId
    sessionStorage.setItem('trackActiveTab', tabId)
  }

  const clearAllTabs = () => {
    tabs.value = [
      {
        id: 'dashboard',
        title: 'Dashboard',
        path: '/',
        component: 'dashboard',
        closeable: false,
        isDefault: true,
      },
    ]
    activeTabId.value = 'dashboard'
    showDefaultTab.value = true
    sessionStorage.removeItem('tabs')
  }

  return {
    tabs,
    activeTabId,
    showDefaultTab,
    addTab,
    removeTab,
    setActiveTab,
    clearAllTabs,
  }
})
