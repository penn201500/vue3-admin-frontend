<template>
  <div class="relative">
    <header
      :class="[
        'flex justify-end items-center p-4 bg-gray-50 dark:bg-gray-700 shadow fixed top-0 left-0 right-0 z-10 transition-transform duration-300 ease-in-out',
        isHeaderVisible ? 'translate-y-0' : '-translate-y-[80%]',
      ]"
      @mouseenter="showHeader"
      @mouseleave="hideHeader"
    >
      <!-- theme switcher -->
      <button
        @click="toggleTheme"
        class="flex items-center space-x-1 mr-4 text-gray-600 dark:text-gray-300 hover:text-blue-500"
      >
        <el-icon>
          <component :is="isDarkMode ? Sunrise : Moon" />
        </el-icon>
        <span class="text-sm">{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
      </button>

      <!-- logout button -->
      <LogoutView />
    </header>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { Moon, Sunrise } from '@element-plus/icons-vue'
import LogoutView from '@/views/LogoutView.vue'
import { computed } from 'vue'
import { useUIStore } from '@/stores/hideThemeSwitcher'

const themeStore = useThemeStore()
const uiStore = useUIStore()

const isDarkMode = computed(() => themeStore.isDarkMode)
const isHeaderVisible = computed(() => uiStore.isHeaderVisible)

const toggleTheme = () => {
  themeStore.toggleDarkMode()
}

const showHeader = () => {
  uiStore.showHeader()
}

const hideHeader = () => {
  uiStore.hideHeader()
}
</script>

<style lang="scss" scoped></style>
