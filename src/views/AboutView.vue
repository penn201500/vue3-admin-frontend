<script setup lang="ts">
import { ref } from 'vue'
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
  } catch (error) {
    console.error('Login error:', error)
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
  } catch (error) {
    console.error('Failed to get user info:', error)
  }
}
</script>

<template>
  <div class="p-2 m-2">
    <el-input v-model="username" placeholder="Username"></el-input>
    <el-input v-model="password" placeholder="Password"></el-input>
    <el-button type="primary" @click="login">Login</el-button>
    <el-button type="success" @click="getUserInfo">Get User-info</el-button>
  </div>
</template>

<style lang="scss" scoped></style>
