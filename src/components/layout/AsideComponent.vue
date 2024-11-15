<!-- AsideComponent.vue -->
<template>
  <el-aside
    :class="['bg-[#d1d1d2] text-white p-0 m-0', { 'hidden sm:block': !isMobile }]"
    :width="isCollapsed ? '64px' : '200px'"
    style="transition: width 0.2s"
  >
    <!-- Aside content -->
    <div class="flex flex-col h-full">
      <!-- Logo or brand -->
      <div class="p-4 py-4 bg-slate-400">
        <span v-if="!isCollapsed" class="text-xl font-medium">Home</span>
        <span v-else class="text-xl">H</span>
      </div>
      <!-- Navigation Menu -->
      <el-menu
        class="border-0 w-full !bg-[#1E3A8A]"
        :collapse="isCollapsed"
        background-color="#263445"
        text-color="#fff"
        active-text-color="#ffd04b"
      >
        <el-menu-item index="1">
          <el-icon><House /></el-icon>
          <span> Dashboard </span>
        </el-menu-item>
        <el-sub-menu index="2">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>Settings</span>
          </template>
          <el-menu-item index="2-1">Item 1</el-menu-item>
          <el-menu-item index="2-2">Item 2</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElAside, ElMenu, ElMenuItem } from 'element-plus'
import { House, Setting } from '@element-plus/icons-vue'

const isCollapsed = ref(false)
const isMobile = ref(false)

function handleResize() {
  isMobile.value = window.innerWidth <= 640
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
