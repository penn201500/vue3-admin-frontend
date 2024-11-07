<script setup lang="ts">
import { ref } from 'vue'
import { ElNotification } from 'element-plus'
import apiClient from '@/utils/apiClient'
const username = ref('')
const password = ref('')
const login = async () => {
  try {
    const response = await apiClient.post('/user/api/login/', {
      username: username.value,
      password: password.value,
    })
    const { access, refresh } = response.data.data
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
    // Show success message using Element Plus Notification
    ElNotification({
      title: 'Success',
      message: 'Login successful!',
      type: 'success',
    })
  } catch (error) {
    console.error('Login error:', error)
    // Show error message
    ElNotification({
      title: 'Error',
      message: 'Login failed. Please check your username and password.',
      type: 'error',
    })
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen px-4 bg-zinc-200">
    <div class="w-full max-w-md p-6 rounded-md shadow-md bg-gray-100">
      <h2 class="text-2xl font-semibold text-center mb-4">Login</h2>
      <div class="flex flex-col space-y-4">
        <el-input v-model="username" placeholder="Username" class="w-full"></el-input>
        <el-input v-model="password" placeholder="Password" class="w-full"></el-input>
        <el-checkbox class="text-xs text-zinc-400 italic">Remember me</el-checkbox>
        <div>
          <el-button type="primary" @click="login" class="w-full block mt-4">Login</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
