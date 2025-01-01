<script setup lang="ts">
import { useI18n } from 'vue-i18n'

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

const { t } = useI18n()

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
  <div
    class="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800"
  >
    <div class="w-full max-w-md">
      <!-- Logo Section -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">VueSys</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">{{ t('auth.welcomeBack') }}</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-lg transition-all duration-300">
        <div class="p-8">
          <form @submit.prevent="login" class="space-y-6">
            <!-- Username Input -->
            <div class="space-y-2">
              <el-input
                v-model="form.username"
                placeholder="Username"
                :class="{ 'is-invalid': v$.username.$error }"
                @blur="v$.username.$touch()"
                @input="sanitizeUsername"
              >
                <template #prefix>
                  <UserIcon class="text-gray-400 dark:text-blue-500" />
                </template>
              </el-input>
              <div v-if="v$.username.$error" class="text-red-500 text-xs pl-1">
                <span v-if="v$.username.required.$invalid">Username is required</span>
                <span v-else-if="v$.username.minLength.$invalid">Minimum 3 characters</span>
              </div>
            </div>

            <!-- Password Input -->
            <div class="space-y-2">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="Password"
                :class="{ 'is-invalid': v$.password.$error }"
                @blur="v$.password.$touch()"
                show-password
              >
                <template #prefix>
                  <UserPasswd class="text-gray-400 dark:text-blue-500" />
                </template>
              </el-input>
              <div v-if="v$.password.$error" class="text-red-500 text-xs pl-1">
                <span v-if="v$.password.required.$invalid">Password is required</span>
                <span v-else-if="v$.password.minLength.$invalid">Minimum 6 characters</span>
              </div>
            </div>

            <!-- Remember Me -->
            <div class="flex items-center justify-between">
              <el-checkbox
                v-model="form.rememberMe"
                class="italic text-sm text-gray-600 dark:text-gray-400"
              >
                Remember me
              </el-checkbox>
              <!-- TODO: Add Forgot Password Link Feature -->
              <!-- <a href="#" class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
                Forgot password?
              </a> -->
            </div>

            <!-- Login Button -->
            <el-button
              type="primary"
              native-type="submit"
              :loading="loading"
              :disabled="v$.$invalid"
              class="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600"
            >
              {{ loading ? 'Logging in...' : 'Login' }}
            </el-button>

            <!-- Sign Up Link -->
            <div class="text-center mt-6">
              <router-link
                to="/signup"
                class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                {{ t('auth.signUp') }}
              </router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
