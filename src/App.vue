<script setup lang="ts">
import { RouterView } from 'vue-router'
import PageFooter from './components/PageFooter.vue'
import { useThemeStore } from './stores/theme'
import { ElIcon } from 'element-plus'
import { Moon, Sunrise } from '@element-plus/icons-vue'
import HeaderView from './components/PageHeader.vue'
import { useUIStore } from './stores/hideThemeSwitcher'
import { computed } from 'vue'

const themeStore = useThemeStore()
const uiStore = useUIStore()

const isHeaderVisible = computed(() => uiStore.isHeaderVisible)
</script>

<template>
  <!-- mode toggle button -->
  <button
    v-if="!isHeaderVisible"
    @click="themeStore.toggleDarkMode()"
    class="fixed top-4 right-4 z-10 w-10 h-10 rounded-full  bg-gray-50 dark:bg-gray-700 shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300"
  >
    <el-icon>
      <component :is="themeStore.isDarkMode ? Sunrise : Moon" />
    </el-icon>
  </button>

  <!-- Header -->
  <HeaderView />

  <RouterView />

  <!-- footer section -->
  <PageFooter />
</template>

<style lang="scss" scoped></style>
