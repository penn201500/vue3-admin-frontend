<script setup lang="ts">
import { RouterView } from 'vue-router'
import PageFooter from './components/PageFooter.vue'
import { useThemeStore } from './stores/theme'
import { ElIcon } from 'element-plus'
import { Moon, Sunrise } from '@element-plus/icons-vue'

// use the theme store
const themeStore = useThemeStore()
</script>

<template>
  <!-- mode toggle button -->
  <button @click="themeStore.toggleDarkMode()" class="fixed top-4 right-4 z-10 p-2 rounded-full">
    <el-icon>
      <component :is="themeStore.isDarkMode ? Sunrise : Moon" />
    </el-icon>
  </button>

  <RouterView />

  <!-- footer section -->
  <PageFooter />
</template>

<style lang="scss" scoped></style>
