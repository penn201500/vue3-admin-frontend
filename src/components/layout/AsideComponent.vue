<template>
  <el-aside
    :class="[
      'border-r dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-100 ease-in-out overflow-hidden',
      { 'w-64': !isCollapsed, 'w-16': isCollapsed },
    ]"
    :width="isCollapsed ? '64px' : '256px'"
  >
    <div class="flex flex-col h-full">
      <!-- Brand Section with same transition effect -->
      <div
        class="flex items-center h-16 px-4 transition-all duration-100 ease-in-out border-b dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden"
      >
        <div
          class="flex items-center transition-all duration-100 ease-in-out"
          :class="{ 'w-full justify-center': isCollapsed }"
        >
          <span
            v-if="!isCollapsed"
            class="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent whitespace-nowrap"
          >
            VueSys Brand and Logo
          </span>
          <span v-else class="text-lg font-bold text-blue-500 transition-all duration-100">
            V
          </span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <el-scrollbar class="flex-1">
        <el-menu
          :class="['border-none bg-transparent', 'el-menu-vertical']"
          :collapse="isCollapsed"
          :collapse-transition="false"
          :default-active="currentRoute"
          @select="handleMenuSelect"
        >
          <template v-for="menu in userMenus" :key="menu.id">
            <!-- Submenu with children -->
            <el-sub-menu
              v-if="menu.children && menu.children.length > 0"
              :index="String(menu.id)"
              :class="[
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                'text-gray-700 dark:text-gray-300',
              ]"
            >
              <template #title>
                <el-icon v-if="menu.icon" class="mr-2">
                  <component :is="getIconComponent(menu.icon)" />
                </el-icon>
                <span>{{ menu.name }}</span>
              </template>

              <el-menu-item
                v-for="child in menu.children"
                :key="child.id"
                :index="child.path"
                :class="[
                  'text-gray-700 dark:text-gray-300',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  'active:bg-blue-50 dark:active:bg-blue-900',
                  'active:text-blue-600 dark:active:text-blue-400',
                ]"
              >
                <el-icon v-if="child.icon" class="mr-2">
                  <component :is="getIconComponent(child.icon)" />
                </el-icon>
                <template #title>
                  <span>{{ child.name }}</span>
                </template>
              </el-menu-item>
            </el-sub-menu>

            <!-- Single menu item -->
            <el-menu-item
              v-else
              :index="menu.path"
              :class="[
                'text-gray-700 dark:text-gray-300',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                'active:bg-blue-50 dark:active:bg-blue-900',
                'active:text-blue-600 dark:active:text-blue-400',
              ]"
            >
              <el-icon v-if="menu.icon" class="mr-2">
                <component :is="getIconComponent(menu.icon)" />
              </el-icon>
              <template #title>
                <span>{{ menu.name }}</span>
              </template>
            </el-menu-item>
          </template>
        </el-menu>
      </el-scrollbar>

      <!-- User Info Section -->
      <div
        class="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900 transition-all duration-100"
        :class="{ 'text-center': isCollapsed }"
      >
        <div class="flex items-center" :class="{ 'justify-center': isCollapsed }">
          <el-avatar :size="32" class="bg-blue-500">
            {{ user?.username?.charAt(0).toUpperCase() }}
          </el-avatar>
          <div v-if="!isCollapsed" class="ml-3 transition-all duration-100">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-200">
              {{ user?.username }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Online</p>
          </div>
        </div>
      </div>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElAside, ElMenu, ElMenuItem, ElScrollbar } from 'element-plus'
import { useIsCollapsedStore } from '@/stores/isCollapsedStore'
import { useTabStore } from '@/stores/tabStore'
import { useRoute } from 'vue-router'
import {
  Monitor,
  Setting,
  User,
  EditPen,
  OfficeBuilding,
  Histogram,
  Files,
  Grid,
  Money,
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/authStore'
import type { Component } from 'vue'
import type { MenuItem } from '@/types/Tabs'

const route = useRoute()
const tabStore = useTabStore()
const authStore = useAuthStore()
const userMenus = computed(() => authStore.userMenus)
const user = computed(() => authStore.user)

const homeLayoutStore = useIsCollapsedStore()
const isCollapsed = computed(() => homeLayoutStore.isCollapsed)
const isMobile = ref(false)
const currentRoute = computed(() => route.path)

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    homeLayoutStore.isCollapsed = true
  }
}

onMounted(async () => {
  window.addEventListener('resize', handleResize)
  handleResize()
  // Only fetch menus if we don't have valid menus already
  const hasValidMenus =
    authStore.userMenus.length > 0 &&
    authStore.userMenus.every((menu) => menu.id && menu.name && menu.path)

  if (!hasValidMenus) {
    await authStore.fetchUserMenus()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

function getIconComponent(iconName: string): Component | undefined {
  const iconsMap: Record<string, Component> = {
    dashboard: Histogram,
    system: Setting,
    monitor: Monitor,
    user: User,
    menus: Files,
    tree: OfficeBuilding,
    post: EditPen,
    grid: Grid,
    money: Money,
  }
  return iconsMap[iconName] || Monitor
}

const findMenuItem = (menus: MenuItem[], path: string): MenuItem | null => {
  for (const menu of menus) {
    if (menu.path === path) return menu
    if (menu.children) {
      const found = findMenuItem(menu.children, path)
      if (found) return found
    }
  }
  return null
}

const handleMenuSelect = (path: string) => {
  const menuItem = findMenuItem(userMenus.value, path)
  if (menuItem) {
    tabStore.addTab({
      id: path,
      title: menuItem.name,
      path: path,
      component: menuItem.component,
      closeable: true,
      icon: menuItem.icon,
    })
  }
}
</script>
