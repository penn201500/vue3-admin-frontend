<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import UserIcon from '@/components/icons/UserIcon.vue'
import UserPasswd from '@/components/icons/UserPasswd.vue'
import useVuelidate from '@vuelidate/core'
import { required, minLength, maxLength, email } from '@vuelidate/validators'
import { ElNotification } from 'element-plus'
import DOMPurify from 'dompurify'
import apiClient from '@/utils/apiClient'
import { AxiosError } from 'axios'
import type { SignupForm } from '@/types/SignupForm'
import { Message } from '@element-plus/icons-vue'
import { useUIStore } from '@/stores/ui'

const router = useRouter()
const loading = ref(false)
const uiStore = useUIStore()

// Define reactive form object
const form = reactive<SignupForm>({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// Define validation rules
const rules = {
  username: {
    required,
    minLength: minLength(3),
    maxLength: maxLength(20),
  },
  email: {
    required,
    email,
  },
  password: {
    required,
    minLength: minLength(6),
    maxLength: maxLength(30),
  },
  confirmPassword: {
    required,
    sameAsPassword: (value: string) => value === form.password,
  },
}

const v$ = useVuelidate(rules, form)

// Sanitize user input
function sanitizeInput(field: keyof SignupForm) {
  form[field] = DOMPurify.sanitize(form[field])
}

async function signup() {
  v$.value.$touch()
  if (v$.value.$invalid) {
    ElNotification({
      title: 'Validation Error',
      message: 'Please correct the errors before proceeding.',
      type: 'warning',
    })
    return
  }

  loading.value = true

  try {
    const response = await apiClient.post('user/api/signup/', {
      username: form.username,
      email: form.email,
      password: form.password,
    })

    if (response.data.code === 200) {
      ElNotification({
        title: 'Success',
        message: 'Registration successful! Please login.',
        type: 'success',
      })
      router.push('/login')
    }
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred. Please try again.'
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message || errorMessage
    }

    ElNotification({
      title: 'Error',
      message: `Registration failed. ${errorMessage}`,
      type: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Lifecycle hooks for floating header
onMounted(() => {
  // Initially hide floating header and show theme switcher
  uiStore.hideFloatingHeader()
  uiStore.showThemeSwitcher()
})

onUnmounted(() => {
  // Clean up
  uiStore.hideFloatingHeader()
  uiStore.hideThemeSwitcher()
})
</script>

<template>
  <div>
    <!-- Theme Switcher Button -->
    <ThemeSwitcher v-if="uiStore.isThemeSwitcherVisible" />

    <!-- Floating Header -->
    <FloatingHeader />

    <!-- Main Content -->
    <div
      class="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800"
    >
      <div class="w-full max-w-md">
        <!-- Logo Section -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">VueSys</h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">Create your account</p>
        </div>

        <!-- Signup Card -->
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-lg transition-all duration-300">
          <div class="p-8">
            <form @submit.prevent="signup" class="space-y-6">
              <!-- Username Input -->
              <div class="space-y-2">
                <el-input
                  v-model="form.username"
                  placeholder="Username"
                  :class="{ 'is-invalid': v$.username.$error }"
                  @blur="v$.username.$touch()"
                  @input="sanitizeInput('username')"
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

              <!-- Email Input -->
              <div class="space-y-2">
                <el-input
                  v-model="form.email"
                  type="email"
                  placeholder="Email"
                  :class="{ 'is-invalid': v$.email.$error }"
                  @blur="v$.email.$touch()"
                  @input="sanitizeInput('email')"
                >
                  <template #prefix>
                    <el-icon class="text-gray-400 dark:text-blue-500">
                      <Message />
                    </el-icon>
                  </template>
                </el-input>
                <div v-if="v$.email.$error" class="text-red-500 text-xs pl-1">
                  <span v-if="v$.email.required.$invalid">Email is required</span>
                  <span v-else-if="v$.email.email.$invalid">Please enter a valid email</span>
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

              <!-- Confirm Password Input -->
              <div class="space-y-2">
                <el-input
                  v-model="form.confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  :class="{ 'is-invalid': v$.confirmPassword.$error }"
                  @blur="v$.confirmPassword.$touch()"
                  show-password
                >
                  <template #prefix>
                    <UserPasswd class="text-gray-400 dark:text-blue-500" />
                  </template>
                </el-input>
                <div v-if="v$.confirmPassword.$error" class="text-red-500 text-xs pl-1">
                  <span v-if="v$.confirmPassword.required.$invalid"
                    >Please confirm your password</span
                  >
                  <span v-else-if="!v$.confirmPassword.sameAsPassword.$invalid"
                    >Passwords do not match</span
                  >
                </div>
              </div>

              <!-- Sign Up Button -->
              <el-button
                type="primary"
                native-type="submit"
                :loading="loading"
                :disabled="v$.$invalid"
                class="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600"
              >
                {{ loading ? 'Creating account...' : 'Create Account' }}
              </el-button>

              <!-- Login Link -->
              <div class="text-center mt-6">
                <router-link
                  to="/login"
                  class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  Already have an account? Login
                </router-link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <PageFooter />
  </div>
</template>

<style lang="scss" scoped></style>
