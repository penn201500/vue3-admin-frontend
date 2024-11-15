<template>
  <header
    :class="[
      'flex justify-end items-center p-4 bg-gray-50/70 dark:bg-gray-700/70 shadow fixed top-0 left-0 right-0 z-10 transition-transform duration-300 ease-in-out',
      isFloatingHeaderVisible ? 'translate-y-0' : '-translate-y-[90%]',
    ]"
    @mouseenter="showFloatingHeader"
    @mouseleave="hideFloatingHeader"
  >
    <!-- Theme Switcher Button -->
    <button
      @click="toggleTheme"
      class="flex items-center space-x-1 mr-4 text-gray-600 dark:text-gray-300 hover:text-blue-500"
    >
      <el-icon>
        <component :is="isDarkMode ? Sunrise : Moon" />
      </el-icon>
      <span class="text-sm">{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
    </button>

    <!-- Logout Button -->
    <LogoutView />
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { Moon, Sunrise } from '@element-plus/icons-vue'
import LogoutView from '@/views/LogoutView.vue'
import { useUIStore } from '@/stores/ui'
import { ElIcon } from 'element-plus'

// Access the theme store
const themeStore = useThemeStore()

// Access the UI store
const uiStore = useUIStore()

// Computed properties
const isDarkMode = computed(() => themeStore.isDarkMode)
const isFloatingHeaderVisible = computed(() => uiStore.isFloatingHeaderVisible)

// Methods
const toggleTheme = () => {
  themeStore.toggleDarkMode()
}

const showFloatingHeader = () => {
  uiStore.showFloatingHeader()
  uiStore.hideThemeSwitcher()
}

const hideFloatingHeader = () => {
  uiStore.hideFloatingHeader()
  uiStore.showThemeSwitcher()
}
</script>

<style scoped>
/* Add any component-specific styles here if necessary */
</style>
