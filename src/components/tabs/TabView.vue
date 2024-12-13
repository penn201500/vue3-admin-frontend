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
      <keep-alive>
        <component :is="currentComponent" />
      </keep-alive>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Component } from 'vue'
import { useRouter } from 'vue-router'
import { useTabStore } from '@/stores/tabStore'
import type { TabPaneClick } from '@/types/TabPaneClick'
import { markRaw } from 'vue'

// Update the ref definition with the correct type
const currentComponent = ref<Component | null>(null)

// Update the ModuleType
type ModuleType = {
  [key: string]: {
    default: Component
  }
}

const modules: ModuleType = import.meta.glob('/src/views/**/*.vue', { eager: true })

const router = useRouter()
const tabStore = useTabStore()

// Initialize from sessionStorage instead of localStorage
const initializeFromStorage = () => {
  const savedTabs = sessionStorage.getItem('vueSysTabs')
  const activeTabId = sessionStorage.getItem('vueSysActiveTab')

  if (savedTabs) {
    tabStore.$patch({
      tabs: JSON.parse(savedTabs),
      activeTabId: activeTabId || 'dashboard',
    })
  }
}

// Watch for changes and save to sessionStorage
watch(
  () => tabStore.tabs,
  (newTabs) => {
    sessionStorage.setItem('vueSysTabs', JSON.stringify(newTabs))
  },
  { deep: true },
)

watch(
  () => tabStore.activeTabId,
  async (newActiveTab) => {
    sessionStorage.setItem('vueSysActiveTab', newActiveTab)
    const activeTabData = tabStore.tabs.find((tab) => tab.id === newActiveTab)
    if (activeTabData) {
      try {
        const componentPath = `/src/views/${activeTabData.component}.vue`
        if (modules[componentPath]) {
          currentComponent.value = markRaw(modules[componentPath].default) as Component
        } else {
          console.error(`Component not found: ${componentPath}`)
          currentComponent.value = null
        }
      } catch (error) {
        console.error('Failed to load component:', error)
        currentComponent.value = null
      }
    }
  },
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
    router.push(targetTab.path)
  }
}

const handleTabRemove = (tabId: string) => {
  const tab = tabStore.tabs.find((t) => t.id === tabId)
  if (tab && tab.closeable) {
    tabStore.removeTab(tabId)
    const activeTab = tabStore.tabs.find((t) => t.id === tabStore.activeTabId)
    if (activeTab) {
      router.push(activeTab.path)
    }
  }
}

// Initialize on mount
initializeFromStorage()
</script>
