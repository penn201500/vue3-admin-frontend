<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import UserIcon from '@/components/icons/UserIcon.vue'
import UserPasswd from '@/components/icons/UserPasswd.vue'
import useVuelidate from '@vuelidate/core'
import { required, minLength, maxLength } from '@vuelidate/validators'
import { ElNotification } from 'element-plus'
import DOMPurify from 'dompurify'
import { useUIStore } from '@/stores/ui'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()

const loading = ref(false)

// Define reactive form object
const form = reactive({
  username: '',
  password: '',
  rememberMe: false,
})

// Define validation rules
const rules = {
  username: {
    required,
    minLength: minLength(3),
    maxLength: maxLength(20),
  },
  password: {
    required,
    minLength: minLength(6),
    maxLength: maxLength(30),
  },
}

const v$ = useVuelidate(rules, form)

// Sanitize user input to prevent XSS
function sanitizeUsername() {
  form.username = DOMPurify.sanitize(form.username)
}

async function login() {
  v$.value.$touch() // Mark all fields as touched
  if (v$.value.$invalid) {
    ElNotification({
      title: 'Validation Error',
      message: 'Please correct the errors before proceeding.',
      type: 'warning',
    })
    return // Prevent login if validation fails
  }

  // Sanitize username before sending
  sanitizeUsername()

  loading.value = true

  try {
    await authStore.login(form.username, form.password, form.rememberMe)
    router.push('/')
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred. Please try again.'

    if (error instanceof Error) {
      errorMessage = error.message
    }

    ElNotification({
      title: 'Error',
      message: `Login failed. ${errorMessage}`,
      type: 'error',
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/')
  }
  // Enable Floating Header and Theme Switcher
  uiStore.hideFloatingHeader()
  uiStore.showThemeSwitcher()
})

onUnmounted(() => {
  // Hide Floating Header and Theme Switcher when leaving the Login view
  uiStore.hideFloatingHeader()
  uiStore.hideThemeSwitcher()
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen px-4 bg-zinc-200 dark:bg-gray-800">
    <div class="w-full max-w-md p-6 rounded-md shadow-md bg-gray-100 dark:bg-gray-900">
      <h2 class="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-gray-100">
        Login
      </h2>
      <form @submit.prevent="login" class="flex flex-col space-y-4">
        <el-input
          v-model="form.username"
          placeholder="Username"
          class="w-full"
          @blur="v$.username.$touch()"
          @input="sanitizeUsername"
        >
          <template #prefix>
            <UserIcon class="text-gray-400 dark:text-blue-500" />
          </template>
        </el-input>
        <div v-if="v$.username.$dirty && v$.username.$invalid" class="text-red-500 text-sm">
          <template v-if="v$.username.required.$invalid">
            <div class="text-xs">Username is required</div>
          </template>
          <template v-else-if="v$.username.minLength.$invalid">
            <div class="text-xs">Username must be at least 3 characters.</div>
          </template>
          <template v-else-if="v$.username.maxLength.$invalid">
            <div class="text-xs">Username cannot exceed 20 characters.</div>
          </template>
        </div>
        <el-input
          v-model="form.password"
          placeholder="Password"
          type="password"
          class="w-full"
          @blur="v$.password.$touch()"
        >
          <template #prefix>
            <UserPasswd class="text-gray-400 dark:text-blue-500" />
          </template>
        </el-input>
        <div v-if="v$.password.$dirty && v$.password.$invalid" class="text-red-500 text-sm">
          <template v-if="v$.password.required.$invalid">
            <div class="text-xs">Password is required.</div>
          </template>
          <template v-else-if="v$.password.minLength.$invalid">
            <div class="text-xs">Password must be at least 6 characters.</div>
          </template>
          <template v-else-if="v$.password.maxLength.$invalid">
            <div class="text-xs">Password cannot exceed 30 characters.</div>
          </template>
        </div>
        <el-checkbox
          v-model="form.rememberMe"
          class="text-xs text-zinc-400 dark:text-zinc-300 italic"
          >Remember me</el-checkbox
        >
        <el-button
          type="primary"
          @click="login"
          class="w-full block mt-4"
          :loading="loading"
          :disabled="v$.$invalid || loading"
          native-type="submit"
          >Login</el-button
        >

        <div class="flex items-center justify-center mt-4 text-sm">
          <router-link
            to="/signup"
            class="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Don't have an account? Sign up
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
