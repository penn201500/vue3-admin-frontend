<template>
  <el-header class="bg-white dark:bg-gray-800 shadow-md border-b dark:border-gray-700 p-0">
    <div class="h-16 px-4 flex items-center justify-between">
      <!-- Left Section -->
      <div class="flex items-center gap-4">
        <el-button
          @click="toggleCollapse"
          class="!flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-transform duration-200"
          :class="{ 'transform rotate-180': isCollapsed }"
        >
          <el-icon class="text-gray-500 dark:text-gray-400">
            <Menu />
          </el-icon>
        </el-button>

        <div class="hidden md:flex items-center gap-2">
          <span
            class="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"
          >
            VueSys
          </span>
        </div>
      </div>

      <!-- Right Section -->
      <div class="flex items-center gap-3">
        <!-- Theme Switch -->
        <el-switch
          v-model="isDarkMode"
          @change="toggleTheme"
          inline-prompt
          :active-icon="Moon"
          :inactive-icon="Sunrise"
          class="mr-2"
        />
        <!--
        TODO: Notifications
        <el-badge :value="3" class="hidden sm:block">
          <el-button
            class="!flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2"
          >
            <el-icon class="text-gray-500 dark:text-gray-400">
              <Bell />
            </el-icon>
          </el-button>
        </el-badge> -->

        <!-- User Profile -->
        <el-dropdown @command="handleCommand" trigger="click">
          <div
            class="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2"
          >
            <el-avatar :size="32" class="bg-blue-500">
              {{ user?.username?.charAt(0).toUpperCase() }}
            </el-avatar>
            <span class="hidden sm:block text-sm text-gray-700 dark:text-gray-300">
              {{ user?.username }}
            </span>
            <el-icon class="text-gray-400">
              <CaretBottom />
            </el-icon>
          </div>

          <template #dropdown>
            <el-dropdown-menu
              class="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700"
            >
              <el-dropdown-item command="Profile" class="!text-gray-700 dark:!text-gray-300">
                <div class="flex items-center gap-2">
                  <el-icon><User /></el-icon>
                  <span>Profile</span>
                </div>
              </el-dropdown-item>
              <el-dropdown-item command="Settings" class="!text-gray-700 dark:!text-gray-300">
                <div class="flex items-center gap-2">
                  <el-icon><Setting /></el-icon>
                  <span>Settings</span>
                </div>
              </el-dropdown-item>
              <el-dropdown-item divided command="Logout" class="!text-red-500">
                <div class="flex items-center gap-2">
                  <el-icon><SwitchButton /></el-icon>
                  <span>Logout</span>
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import {
  // Bell,  // Uncomment when notifications are implemented
  Menu,
  Setting,
  User,
  Moon,
  Sunrise,
  CaretBottom,
  SwitchButton,
} from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/authStore'
import { useTabStore } from '@/stores/tabStore'
import { useRouter } from 'vue-router'
import { useIsCollapsedStore } from '@/stores/isCollapsedStore'

const homeLayoutStore = useIsCollapsedStore()
const authStore = useAuthStore()
const tabStore = useTabStore()
const router = useRouter()

const isCollapsed = computed(() => homeLayoutStore.isCollapsed)
const user = computed(() => authStore.user)

const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.isDarkMode)

const toggleCollapse = () => homeLayoutStore.toggleCollapse()
const toggleTheme = () => themeStore.toggleDarkMode()

const handleCommand = async (command: string) => {
  switch (command) {
    case 'Profile':
      // Add a new tab for Profile
      tabStore.addTab({
        id: 'profile',
        title: 'Profile',
        path: '/profile',
        component: 'profile',
        closeable: true,
      })
      break
    case 'Settings':
      await router.push('/settings')
      break
    case 'Logout':
      await authStore.logout()
      break
    default:
      break
  }
}
</script>

<style lang="scss" scoped></style>
