<!-- src/components/Logout.vue -->
<template>
  <button
    @click="handleLogout"
    class="flex items-center space-x-1 text-gray-600 dark:text-gray-300 group"
  >
    <el-icon>
      <LogoutIcon class="dark:text-gray-300 group-hover:text-red-500" />
    </el-icon>
    <span class="text-sm group-hover:text-red-500">Logout</span>
  </button>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import LogoutIcon from '@/components/icons/LogoutIcon.vue'
import { ElNotification } from 'element-plus'

const authStore = useAuthStore()

/**
 * Handles the logout process by calling the authStore's logout function.
 * If the user is not authenticated, shows a notification.
 */
const handleLogout = async () => {
  if (!authStore.isAuthenticated) {
    ElNotification({
      title: 'Not Logged In',
      message: 'You are not currently logged in.',
      type: 'warning',
    })
    return
  }

  await authStore.logout()
}
</script>

<style lang="scss" scoped></style>
