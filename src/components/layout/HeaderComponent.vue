<template>
  <el-header class="bg-[#BBD5F8] shadow-md flex items-center justify-between px-4">
    <div class="flex items-center space-x-4">
      <div class="text-lg font-semibold text-gray-800 dark:text-white">VueSys</div>
    </div>
    <div class="flex items-center gap-4">
      <!-- Search Bar -->
      <el-input
        v-model="searchText"
        placeholder="Search"
        class="w-64"
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
        class="ml-2"
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
import { Search, UserFilled, Moon, Sunrise } from '@element-plus/icons-vue'
import { ref, computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const searchText = ref('')
const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.isDarkMode)
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
