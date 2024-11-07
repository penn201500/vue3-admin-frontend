<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElNotification } from 'element-plus'
import apiClient from '@/utils/apiClient'
import UserIcon from '@/components/icons/UserIcon.vue'
import UserPasswd from '@/components/icons/UserPasswd.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')
const rememberMe = ref(false)

// Function to verify token validity
const verifyTokenValidity = async (): Promise<boolean> => {
  try {
    const accessToken = rememberMe.value
      ? localStorage.getItem('accessToken')
      : sessionStorage.getItem('accessToken')

    if (!accessToken) return false

    // Set the Authorization header
    const response = await apiClient.get('/user/api/token/validity/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (response.data.code === 200 && response.data.valid) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.error('Token validity check failed:', error)
    return false
  }
}

// Initialize rememberMe based on stored preference
onMounted(async () => {
  const storedRememberMe = localStorage.getItem('rememberMe') === 'true'
  rememberMe.value = storedRememberMe

  if (storedRememberMe) {
    const storedUsername = localStorage.getItem('username') || ''
    username.value = storedUsername

    const isValid = await verifyTokenValidity()

    if (isValid) {
      // Redirect to home if token is valid
      router.push('/')
    } else {
      // Invalid token, clear storage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('username')
      localStorage.setItem('rememberMe', 'false')
    }
  }
})

const login = async () => {
  try {
    const response = await apiClient.post('/user/api/login/', {
      username: username.value,
      password: password.value,
    })
    const { access, refresh } = response.data.data

    if (rememberMe.value) {
      localStorage.setItem('accessToken', access)
      localStorage.setItem('refreshToken', refresh)
      localStorage.setItem('rememberMe', 'true')
      localStorage.setItem('username', username.value)
    } else {
      sessionStorage.setItem('accessToken', access)
      sessionStorage.setItem('refreshToken', refresh)
      localStorage.setItem('rememberMe', 'false')
      localStorage.removeItem('username')
    }

    // Show success message using Element Plus Notification
    ElNotification({
      title: 'Success',
      message: 'Login successful!',
      type: 'success',
    })

    router.push('/')
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
  <div class="flex items-center justify-center min-h-screen px-4 bg-zinc-200 dark:bg-gray-800">
    <div class="w-full max-w-md p-6 rounded-md shadow-md bg-gray-100 dark:bg-gray-900">
      <h2 class="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-gray-100">
        Login
      </h2>
      <div class="flex flex-col space-y-4">
        <el-input v-model="username" placeholder="Username" class="w-full">
          <template #prefix>
            <UserIcon class="text-gray-400 dark:text-blue-500" />
          </template>
        </el-input>
        <el-input v-model="password" placeholder="Password" class="w-full">
          <template #prefix>
            <UserPasswd class="text-gray-400 dark:text-blue-500" />
          </template>
        </el-input>
        <el-checkbox v-model="rememberMe" class="text-xs text-zinc-400 dark:text-zinc-300 italic"
          >Remember me</el-checkbox
        >
        <div>
          <el-button type="primary" @click="login" class="w-full block mt-4">Login</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
