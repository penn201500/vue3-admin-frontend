<!-- src/components/Header.vue -->
<template>
  <header
    class="flex justify-end items-center p-4 bg-white dark:bg-gray-800 shadow fixed top-0 left-0 right-0 z-10"
  >
    <!-- Theme Switcher -->
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
import { useThemeStore } from '@/stores/theme'
import { Moon, Sunrise } from '@element-plus/icons-vue'
import LogoutView from '@/views/LogoutView.vue'
import { computed } from 'vue'

const themeStore = useThemeStore()

const isDarkMode = computed(() => themeStore.isDarkMode)

const toggleTheme = () => {
  themeStore.toggleDarkMode()
}
</script>

<style lang="scss" scoped></style>
