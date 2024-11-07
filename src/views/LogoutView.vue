<!-- src/components/Logout.vue -->
<template>
  <button
    @click="logout"
    class="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-red-500"
  >
    <el-icon>
      <LogoutIcon class="hover:text-red-500" />
    </el-icon>
    <span class="text-sm">Logout</span>
  </button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import LogoutIcon from '@/components/icons/LogoutIcon.vue'

const router = useRouter()

const isLoggedIn = () => {
  const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
  return !!accessToken
}

const logout = () => {
  if (!isLoggedIn()) {
    ElNotification({
      title: 'Not Logged In',
      message: 'You are not currently logged in.',
      type: 'warning',
    })
    return
  }
  // Clear tokens from storage
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('rememberMe')
  localStorage.removeItem('username')

  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('refreshToken')

  // Show logout notification
  ElNotification({
    title: 'Logged Out',
    message: 'You have been successfully logged out.',
    type: 'info',
  })

  // Redirect to login page
  router.push('/login')
}
</script>

<style lang="scss" scoped></style>
