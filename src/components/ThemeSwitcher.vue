<template>
  <button
    @click="toggleTheme"
    class="fixed top-4 right-4 z-10 w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700 shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300"
  >
    <el-icon>
      <component :is="isDarkMode ? Sunrise : Moon" />
    </el-icon>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { Moon, Sunrise } from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'

// Access the theme store
const themeStore = useThemeStore()

// Computed property to determine current theme
const isDarkMode = computed(() => themeStore.isDarkMode)

// Method to toggle theme
const toggleTheme = () => {
  themeStore.toggleDarkMode()
}
</script>

<style scoped></style>
