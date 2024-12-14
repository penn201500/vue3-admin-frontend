<template>
  <div class="flex flex-col h-full">
    <el-tabs
      v-model="activeTab"
      type="card"
      closable
      @tab-click="handleTabClick"
      @tab-remove="handleTabRemove"
      class="bg-white"
    >
      <el-tab-pane
        v-for="tab in visibleTabs"
        :key="tab.id"
        :label="tab.title"
        :name="tab.id"
        :closable="tab.closeable"
      >
        <template #label>
          <el-icon v-if="tab.icon" class="mr-1">
            <component :is="tab.icon" />
          </el-icon>
          <span>{{ tab.title }}</span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <div class="flex-1 overflow-auto p-4 bg-gray-50">
      <component :is="currentComponent" v-if="currentComponent" :key="activeTab" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Component } from 'vue'
import { useTabStore } from '@/stores/tabStore'
import type { TabPaneClick } from '@/types/TabPaneClick'
import { markRaw } from 'vue'

const currentComponent = ref<Component | null>(null)

// Define the components map
const componentMap: Record<string, () => Promise<{ default: Component }>> = {
  'bizm/Department': () => import('@/views/bizm/DepartmentView.vue'),
  'bizm/DepartmentView': () => import('@/views/bizm/DepartmentView.vue'),
  'bizm/Post': () => import('@/views/bizm/PostView.vue'),
  'bizm/PostView': () => import('@/views/bizm/PostView.vue'),
  'settings/user/index': () => import('@/views/settings/user/index.vue'),
  'settings/role/index': () => import('@/views/settings/role/index.vue'),
  'settings/menu/index': () => import('@/views/settings/menu/index.vue'),
}

const tabStore = useTabStore()

// Watch for changes and save to sessionStorage
watch(
  () => tabStore.tabs,
  (newTabs) => {
    sessionStorage.setItem('vueSysTabs', JSON.stringify(newTabs))
  },
  { deep: true },
)

const loadComponent = async (componentPath: string) => {
  console.log('Loading component path:', componentPath)
  try {
    if (componentPath === 'dashboard') {
      return null
    }

    // Normalize the component path
    const normalizedPath = componentPath.replace(/^\/+/, '')

    if (normalizedPath in componentMap) {
      const module = await componentMap[normalizedPath]()
      return markRaw(module.default)
    } else {
      console.error(`Component not found in map: ${normalizedPath}`)
      console.log('Available components:', Object.keys(componentMap))
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
