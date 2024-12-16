<template>
  <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
    <div class="max-w-4xl mx-auto">
      <!-- Profile Header -->
      <div class="mb-8 text-center">
        <div class="mb-4">
          <el-avatar :size="100" :src="user?.avatar">
            <el-icon><UserFilled /></el-icon>
          </el-avatar>
        </div>
        <el-upload
          class="mb-4"
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          accept="image/*"
          @change="handleAvatarChange"
        >
          <el-button size="small" type="primary">Change Avatar</el-button>
        </el-upload>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {{ user?.username || 'User Profile' }}
        </h1>
      </div>

      <!-- Profile Information Form -->
      <el-form
        ref="formRef"
        :model="profileForm"
        :rules="rules"
        label-position="top"
        class="space-y-6"
      >
        <!-- Basic Information Section -->
        <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Basic Information
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <el-form-item label="Username" prop="username">
              <el-input v-model="profileForm.username" disabled />
            </el-form-item>

            <el-form-item label="Email" prop="email">
              <el-input v-model="profileForm.email" />
            </el-form-item>

            <el-form-item label="Phone" prop="phone">
              <el-input v-model="profileForm.phone" maxlength="11" />
            </el-form-item>

            <el-form-item label="Status">
              <el-tag :type="statusType">
                {{ statusText }}
              </el-tag>
            </el-form-item>
          </div>
        </div>

        <!-- Additional Information Section -->
        <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Additional Information
          </h2>

          <div class="space-y-4">
            <el-form-item label="Comment" prop="comment">
              <el-input
                v-model="profileForm.comment"
                type="textarea"
                :rows="3"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <!-- Read-only Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <p class="mb-1">Last Login</p>
                <p class="font-medium">{{ formatDateTime(user?.login_date) }}</p>
              </div>
              <div>
                <p class="mb-1">Account Created</p>
                <p class="font-medium">{{ formatDateTime(user?.create_time) }}</p>
              </div>
              <div>
                <p class="mb-1">Last Updated</p>
                <p class="font-medium">{{ formatDateTime(user?.update_time) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Theme Settings -->
        <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Preferences
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <el-form-item label="Language">
              <el-select v-model="profileForm.language" class="w-full">
                <el-option label="English" value="en" />
                <el-option label="中文" value="zh" />
              </el-select>
            </el-form-item>

            <el-form-item label="Theme">
              <el-select
                v-model="isDarkMode"
                class="w-full"
                @change="handleThemeChange"
              >
                <el-option label="Light" :value="false" />
                <el-option label="Dark" :value="true" />
              </el-select>
            </el-form-item>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-4">
          <el-button @click="resetForm">Reset</el-button>
          <el-button type="primary" @click="saveChanges" :loading="loading">
            Save Changes
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/theme'
import { ElNotification } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import type { FormInstance, UploadFile } from 'element-plus'
import type { User } from '@/types/User'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const loading = ref(false)
const formRef = ref<FormInstance>()

const user = computed(() => authStore.user)
const isDarkMode = computed({
  get: () => themeStore.isDarkMode,
  set: (value) => themeStore.toggleDarkMode()
})

// Form validation rules
const rules = {
  email: [
    { type: 'email', message: 'Please enter a valid email address', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: 'Please enter a valid phone number', trigger: 'blur' }
  ]
}

// Profile form data
const profileForm = reactive({
  username: user.value?.username || '',
  email: user.value?.email || '',
  phone: user.value?.phone || '',
  comment: user.value?.comment || '',
  language: 'en' // Default language
})

// Computed properties for status
const statusType = computed(() => {
  switch (user.value?.status) {
    case 1:
      return 'success'
    case 0:
      return 'danger'
    default:
      return 'info'
  }
})

const statusText = computed(() => {
  switch (user.value?.status) {
    case 1:
      return 'Active'
    case 0:
      return 'Inactive'
    default:
      return 'Unknown'
  }
})

// Methods
const handleThemeChange = (value: boolean) => {
  if (value !== themeStore.isDarkMode) {
    themeStore.toggleDarkMode()
  }
}

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

const handleAvatarChange = (uploadFile: UploadFile) => {
  // Handle avatar upload here
  console.log('Avatar file:', uploadFile)
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const saveChanges = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // Save changes logic will be implemented later
        ElNotification({
          title: 'Success',
          message: 'Profile updated successfully',
          type: 'success'
        })
      } catch (error) {
        ElNotification({
          title: 'Error',
          message: 'Failed to update profile',
          type: 'error'
        })
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
