<script setup lang="ts">
import { ref } from 'vue'
import { ElNotification } from 'element-plus'
import apiClient from '@/utils/apiClient'

const username = ref('')
const password = ref('')
const userInfoID = ref('')
const userInfoName = ref('')
const userInfoEmail = ref('')

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
      message: 'Login failed. Please check your credentials.',
      type: 'error',
    })
  }
}

const getUserInfo = async () => {
  try {
    const accessToken = localStorage.getItem('accessToken')
    const response = await apiClient.get('/user/api/user-info/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    console.log('Here is the user info:', response.data.data)
    const data = response.data.data
    userInfoID.value = data.id
    userInfoName.value = data.username
    userInfoEmail.value = data.email

    // Show success message
    ElNotification({
      title: 'Success',
      message: 'User info retrieved successfully!',
      type: 'success',
    })
  } catch (error) {
    console.error('Failed to get user info:', error)

    // Show error message
    ElNotification({
      title: 'Error',
      message: 'Failed to get user info. Please login first.',
      type: 'error',
    })
  }
}
</script>

<template>
  <div class="p-2">
    <div class="max-w-md mx-auto bg-white p-6 rounded-md shadow-md">
      <h2 class="text-2xl font-semibold text-center mb-4">Login</h2>
      <div class="flex flex-col space-y-4">
        <el-input v-model="username" placeholder="Username" class="w-full"></el-input>
        <el-input v-model="password" placeholder="Password" class="w-full"></el-input>
        <el-button type="primary" @click="login" class="w-full mt-4">Login</el-button>
        <el-button type="success" @click="getUserInfo" class="w-full !ml-0 mt-2"
          >Get User Info</el-button
        >
      </div>
      <!-- display user info -->
      <div v-if="userInfoName" class="mt-6">
        <h3 class="text-xl font-semibold mb-2">User Information</h3>
        <p><strong>User ID: </strong> {{ userInfoID }}</p>
        <p><strong>Username: </strong> {{ userInfoName }}</p>
        <p><strong>Email: </strong> {{ userInfoEmail }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
