<script setup lang="ts">
import { reactive, ref } from 'vue'
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

const router = useRouter()
const loading = ref(false)

// Define reactive form object
const form = reactive<SignupForm>({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Define validation rules
const rules = {
  username: {
    required,
    minLength: minLength(3),
    maxLength: maxLength(20)
  },
  email: {
    required,
    email
  },
  password: {
    required,
    minLength: minLength(6),
    maxLength: maxLength(30)
  },
  confirmPassword: {
    required,
    sameAsPassword: (value: string) => value === form.password
  }
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
      type: 'warning'
    })
    return
  }

  loading.value = true

  try {
    const response = await apiClient.post('user/api/signup/', {
      username: form.username,
      email: form.email,
      password: form.password
    })

    if (response.data.code === 200) {
      ElNotification({
        title: 'Success',
        message: 'Registration successful! Please login.',
        type: 'success'
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
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <div class="flex items-center justify-center min-h-screen px-4 bg-zinc-200 dark:bg-gray-800">
    <div class="w-full max-w-md p-6 rounded-md shadow-md bg-gray-100 dark:bg-gray-900">
      <h2 class="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-gray-100">
        Sign Up
      </h2>
      <form @submit.prevent="signup" class="flex flex-col space-y-4">
        <el-input
          v-model="form.username"
          placeholder="Username"
          class="w-full"
          @blur="v$.username.$touch()"
          @input="sanitizeInput('username')"
        >
          <template #prefix>
            <UserIcon class="text-gray-400 dark:text-blue-500" />
          </template>
        </el-input>
        <div v-if="v$.username.$dirty && v$.username.$invalid" class="text-red-500 text-xs">
          <div v-if="v$.username.required.$invalid">Username is required</div>
          <div v-else-if="v$.username.minLength.$invalid">Username must be at least 3 characters</div>
          <div v-else-if="v$.username.maxLength.$invalid">Username cannot exceed 20 characters</div>
        </div>

        <el-input
          v-model="form.email"
          placeholder="Email"
          type="email"
          class="w-full"
          @blur="v$.email.$touch()"
          @input="sanitizeInput('email')"
        >
          <template #prefix>
            <i class="el-icon-message"></i>
          </template>
        </el-input>
        <div v-if="v$.email.$dirty && v$.email.$invalid" class="text-red-500 text-xs">
          <div v-if="v$.email.required.$invalid">Email is required</div>
          <div v-else-if="v$.email.email.$invalid">Please enter a valid email address</div>
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
        <div v-if="v$.password.$dirty && v$.password.$invalid" class="text-red-500 text-xs">
          <div v-if="v$.password.required.$invalid">Password is required</div>
          <div v-else-if="v$.password.minLength.$invalid">Password must be at least 6 characters</div>
          <div v-else-if="v$.password.maxLength.$invalid">Password cannot exceed 30 characters</div>
        </div>

        <el-input
          v-model="form.confirmPassword"
          placeholder="Confirm Password"
          type="password"
          class="w-full"
          @blur="v$.confirmPassword.$touch()"
        >
          <template #prefix>
            <UserPasswd class="text-gray-400 dark:text-blue-500" />
          </template>
        </el-input>
        <div v-if="v$.confirmPassword.$dirty && v$.confirmPassword.$invalid" class="text-red-500 text-xs">
          <div v-if="v$.confirmPassword.required.$invalid">Please confirm your password</div>
          <div v-else-if="!v$.confirmPassword.sameAsPassword.$invalid">Passwords do not match</div>
        </div>

        <el-button
          type="primary"
          @click="signup"
          class="w-full block mt-4"
          :loading="loading"
          :disabled="v$.$invalid || loading"
          native-type="submit"
        >
          Sign Up
        </el-button>

        <div class="text-center mt-4">
          <router-link
            to="/login"
            class="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Already have an account? Login
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
