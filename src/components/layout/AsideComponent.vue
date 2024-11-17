<template>
  <el-aside
    :class="['bg-gray-200 overflow-hidden', { 'w-64': !isCollapsed, 'w-16': isCollapsed }]"
    :width="isCollapsed ? '64px' : '200px'"
  >
    <!-- Aside content -->
    <div class="flex flex-col h-full">
      <!-- Logo or brand -->
      <div class="flex items-center justify-center h-16 bg-gray-300 overflow-hidden">
        <!-- Full Logo/Brand Text -->
        <span v-if="!isCollapsed" class="text-lg font-semibold"> Logo or Brand Will be Here </span>
        <!-- Simplified Logo/Brand Text -->
        <span v-else class="text-lg"> B </span>
      </div>
      <!-- Navigation Menu -->
      <el-menu
        class="border-0 flex-1 bg-[#1E3A8A]"
        :collapse="isCollapsed"
        background-color="#263445"
        text-color="#fff"
        active-text-color="#ffd04b"
        :collapse-transition="false"
      >
        <el-menu-item index="1">
          <el-icon><House /></el-icon>
          <span> Dashboard </span>
        </el-menu-item>
        <el-sub-menu index="2">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span> Settings </span>
          </template>
          <el-menu-item index="2-1">Item 1</el-menu-item>
          <el-menu-item index="2-2">Item 2</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { ElAside, ElMenu, ElMenuItem } from 'element-plus'
import { House, Setting } from '@element-plus/icons-vue'
import { useHomeLayoutStore } from '@/stores/homeLayoutStore'

const homeLayoutStore = useHomeLayoutStore()
const isCollapsed = computed(() => homeLayoutStore.isCollapsed)
const isMobile = ref(false)

const handleResize = () => {
  isMobile.value = window.innerWidth <= 640
}

// Automatically collapse the sidebar on mobile
watch(isMobile, (newVal) => {
  homeLayoutStore.isCollapsed = newVal
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
  homeLayoutStore.isCollapsed = isMobile.value
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
