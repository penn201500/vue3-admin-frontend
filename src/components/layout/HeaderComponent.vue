<template>
  <el-header class="bg-blue-100 shadow-md p-4">
    <div class="flex items-center justify-between mx-auto">
      <div class="flex items-center space-x-4">
        <el-button
          @click="toggleCollapse"
          class="p-2 hover:bg-blue-200 rounded-lg lg:hidden dark:text-white"
        >
          <el-icon>
            <Menu />
          </el-icon>
        </el-button>
        <div class="text-lg font-semibold text-gray-800 dark:text-white">VueSys</div>
      </div>
      <div class="flex items-center space-x-4">
        <!-- Search Bar -->
        <el-input
          v-model="searchText"
          placeholder="Search"
          class="max-w-md hidden md:block"
          :bg="isDarkMode ? 'dark:bg-gray-700' : 'bg-white'"
          :input-style="{
            color: isDarkMode ? '#fff' : '#000',
          }"
        >
          <template #prefix>
            <el-icon class="text-blue-400"><Search /></el-icon>
          </template>
        </el-input>
        <!-- Theme Switcher -->
        <el-switch
          v-model="isDarkMode"
          @change="toggleTheme"
          class="mx-4"
          inline-prompt
          :active-icon="Sunrise"
          :inactive-icon="Moon"
          size="default"
        />
        <!-- User Profile Dropdown -->
        <el-dropdown @command="handleCommand">
          <el-avatar :icon="UserFilled" class="cursor-pointer" size="small" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="Profile">Profile</el-dropdown-item>
              <el-dropdown-item command="Settings">Settings</el-dropdown-item>
              <el-dropdown-item command="Logout">Logout</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import {
  ElHeader,
  ElInput,
  ElDropdown,
  ElAvatar,
  ElIcon,
  ElDropdownMenu,
  ElDropdownItem,
  ElSwitch,
} from 'element-plus'
import { Search, UserFilled, Moon, Sunrise, Menu } from '@element-plus/icons-vue'
import { ref, computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import { useHomeLayoutStore } from '@/stores/homeLayoutStore'

const homeLayoutStore = useHomeLayoutStore()
const authStore = useAuthStore()
const router = useRouter()
const searchText = ref('')
const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.isDarkMode)

const toggleCollapse = () => homeLayoutStore.toggleCollapse()

const toggleTheme = () => themeStore.toggleDarkMode()

const handleCommand = async (command: string) => {
  switch (command) {
    case 'Profile':
      console.log('Command received:', command)
      await router.push('/profile')
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
