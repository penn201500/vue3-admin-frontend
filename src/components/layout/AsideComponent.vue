<template>
  <el-aside
    :class="[
      'bg-gray-600 text-gray-100 overflow-hidden',
      { 'w-64': !isCollapsed, 'w-16': isCollapsed },
    ]"
    :width="isCollapsed ? '64px' : '200px'"
  >
    <!-- Aside content -->
    <div class="flex flex-col h-full">
      <!-- Logo or brand -->
      <div
        class="flex items-center justify-center h-16 text-blue-500 border-b-4 border-b-slate-500 dark:border-b-white overflow-hidden"
      >
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
        @select="handleMenuSelect"
      >
        <template v-for="menu in userMenus" :key="menu.id">
          <!-- If menu has children -->
          <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="String(menu.id)">
            <template #title>
              <!-- If you have icons mapped to components -->
              <el-icon v-if="menu.icon">
                <!-- Adjust icon component usage as needed -->
                <component :is="getIconComponent(menu.icon)" />
              </el-icon>
              <span>{{ menu.name }}</span>
            </template>

            <el-menu-item v-for="child in menu.children" :key="child.id" :index="child.path">
              <el-icon v-if="child.icon">
                <component :is="getIconComponent(child.icon)" />
              </el-icon>
              <span>{{ child.name }}</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- If menu has no children -->
          <el-menu-item v-else :index="menu.path">
            <el-icon v-if="menu.icon">
              <component :is="getIconComponent(menu.icon)" />
            </el-icon>
            <span>{{ menu.name }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { ElAside, ElMenu, ElMenuItem } from 'element-plus'
import { useIsCollapsedStore } from '@/stores/isCollapsedStore'
import { useTabStore } from '@/stores/tabStore'
import {
  Monitor,
  UserFilled,
  Setting,
  Edit,
  EditPen,
  OfficeBuilding,
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/authStore'
import type { Component } from 'vue'
import type { MenuItem } from '@/types/Tabs'

const tabStore = useTabStore()
const authStore = useAuthStore()
const userMenus = computed(() => authStore.userMenus)

const homeLayoutStore = useIsCollapsedStore()
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

function getIconComponent(iconName: string): Component | undefined {
  const iconsMap: Record<string, Component> = {
    system: Setting,
    monitor: Monitor,
    user: UserFilled,
    peoples: UserFilled,
    'tree-table': Edit,
    tree: OfficeBuilding,
    post: EditPen,
  }
  return iconsMap[iconName] || Monitor
}

// Function to find menu item by path
const findMenuItem = (menus: MenuItem[], path: string): MenuItem | null => {
  for (const menu of menus) {
    if (menu.path === path) {
      return menu
    }
    if (menu.children) {
      const found = findMenuItem(menu.children, path)
      if (found) {
        return found
      }
    }
  }
  return null
}

// Add menu selection handler
const handleMenuSelect = (path: string) => {
  const menuItem = findMenuItem(userMenus.value, path)
  if (menuItem) {
    tabStore.addTab({
      id: path,
      title: menuItem.name, // Changed from title to name to match MenuItem interface
      path: path,
      component: menuItem.component,
      closeable: true,
      icon: menuItem.icon,
    })
  }
}
</script>

<style lang="scss" scoped>
.el-menu-item.is-active {
  background-color: #20a0ff;
}
</style>
