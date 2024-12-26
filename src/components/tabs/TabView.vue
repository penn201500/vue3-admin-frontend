<template>
  <div class="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
    <!-- Tab Navigation -->
    <div class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-2">
      <el-tabs
        v-model="activeTab"
        type="card"
        closable
        @tab-click="handleTabClick"
        @tab-remove="handleTabRemove"
        class="min-h-[40px] !border-0"
      >
        <el-tab-pane
          v-for="tab in visibleTabs"
          :key="tab.id"
          :label="tab.title"
          :name="tab.id"
          :closable="tab.closeable"
        >
          <template #label>
            <div class="flex items-center gap-1 px-1">
              <el-icon v-if="tab.icon" class="text-gray-500 dark:text-gray-400">
                <component :is="tab.icon" />
              </el-icon>
              <span class="truncate max-w-[120px]">{{ tab.title }}</span>
            </div>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- Tab Content Area -->
    <div class="flex-1 overflow-auto p-4">
      <transition
        enter-active-class="transition-opacity duration-200 ease-in"
        leave-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
        mode="out-in"
      >
        <div :key="activeTab" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <component
            :is="currentComponent"
            v-if="currentComponent"
            v-bind="activeTabData?.props || {}"
          />
          <div v-else-if="activeTab === 'dashboard'" class="space-y-4">
            <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Welcome to Dashboard
            </h1>
            <p class="text-gray-600 dark:text-gray-400">Select a menu item to get started.</p>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Component } from 'vue'
import { useTabStore } from '@/stores/tabStore'
import type { TabPaneClick } from '@/types/TabPaneClick'
import { markRaw } from 'vue'

// Define interface for tab data
interface TabData {
  id: string
  title: string
  path: string
  component: string
  icon?: string
  closeable?: boolean
  isDefault?: boolean
  props?: Record<string, unknown>
}

const currentComponent = ref<Component | null>(null)

// Define the components map with lazy loading
const componentMap: Record<string, () => Promise<{ default: Component }>> = {
  'bizm/Department': () => import('@/views/bizm/DepartmentView.vue'),
  'bizm/DepartmentView': () => import('@/views/bizm/DepartmentView.vue'),
  'bizm/Post': () => import('@/views/bizm/PostView.vue'),
  'bizm/PostView': () => import('@/views/bizm/PostView.vue'),
  'settings/user/index': () => import('@/views/settings/user/indexView.vue'),
  'settings/role/index': () => import('@/views/settings/role/indexView.vue'),
  'settings/menu/index': () => import('@/views/settings/menu/indexView.vue'),
  'profile': () => import('@/views/ProfileView.vue'),
  'ProfileView': () => import('@/views/ProfileView.vue'),
  'userProfile': () => import('@/views/ProfileView.vue'),
  // settings: () => import('@/views/SettingsView.vue'),  // TODO: Uncomment when SettingsView is implemented
}

const tabStore = useTabStore()

const activeTabData = computed(() => {
  const tab = tabStore.tabs.find((tab) => tab.id === activeTab.value)
  return tab as TabData | undefined
})

// Watch for tab changes and save to sessionStorage
watch(
  () => tabStore.tabs,
  (newTabs) => {
    sessionStorage.setItem('vueSysTabs', JSON.stringify(newTabs))
  },
  { deep: true },
)

const loadComponent = async (componentPath: string) => {
  try {
    if (componentPath === 'dashboard') {
      return null
    }

    const normalizedPath = componentPath.replace(/^\/+/, '')

    if (normalizedPath in componentMap) {
      const module = await componentMap[normalizedPath]()
      return markRaw(module.default)
    } else {
      console.warn(`Component not found in map: ${normalizedPath}`)
      return null
    }
  } catch (error) {
    console.error(`Failed to load component: ${componentPath}`, error)
    return null
  }
}

const initializeFromStorage = () => {
  const savedTabs = sessionStorage.getItem('vueSysTabs')
  const activeTabId = sessionStorage.getItem('vueSysActiveTab')

  if (savedTabs) {
    tabStore.$patch({
      tabs: JSON.parse(savedTabs),
      activeTabId: activeTabId || 'dashboard',
    })
  } else {
    tabStore.addTab({
      id: 'dashboard',
      title: 'Dashboard',
      path: '/',
      component: 'dashboard',
      closeable: false,
      isDefault: true,
    })
  }
}

watch(
  () => tabStore.activeTabId,
  async (newActiveTab) => {
    if (!newActiveTab) return

    sessionStorage.setItem('vueSysActiveTab', newActiveTab)
    const activeTabData = tabStore.tabs.find((tab) => tab.id === newActiveTab)

    if (activeTabData?.component) {
      try {
        currentComponent.value = await loadComponent(activeTabData.component)
      } catch (error) {
        console.error('Failed to load component:', error)
        currentComponent.value = null
      }
    } else {
      currentComponent.value = null
    }
  },
  { immediate: true },
)

const activeTab = computed({
  get: () => tabStore.activeTabId,
  set: (value: string) => tabStore.setActiveTab(value),
})

const visibleTabs = computed(() => {
  return tabStore.tabs.filter((tab) => !tab.isDefault || (tab.isDefault && tabStore.showDefaultTab))
})

const handleTabClick = (tab: TabPaneClick) => {
  const targetTab = tabStore.tabs.find((t) => t.id === tab.paneName)
  if (targetTab) {
    tabStore.setActiveTab(tab.paneName)
  }
}

const handleTabRemove = (tabId: string) => {
  const tab = tabStore.tabs.find((t) => t.id === tabId)
  if (tab && tab.closeable) {
    tabStore.removeTab(tabId)
  }
}

// Initialize on mount
initializeFromStorage()
</script>
