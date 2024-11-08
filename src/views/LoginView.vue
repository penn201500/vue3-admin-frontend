<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import UserIcon from '@/components/icons/UserIcon.vue'
import UserPasswd from '@/components/icons/UserPasswd.vue'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const rememberMe = ref(false)

const login = async () => {
  await authStore.login(username.value, password.value, rememberMe.value)
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
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
