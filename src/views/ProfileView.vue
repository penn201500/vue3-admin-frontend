<template>
  <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
    <div class="max-w-4xl mx-auto">
      <!-- Profile Header -->
      <div class="mb-8 text-center">
        <div class="avatar-wrapper" tabindex="-1" aria-label="User avatar">
          <el-avatar :size="100" :src="currentUser?.avatar">
            <el-icon><UserFilled /></el-icon>
          </el-avatar>
        </div>
        <el-upload
          class="mb-4"
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          accept="image/*"
          @change="onAvatarChange"
        >
          <el-button size="small" type="primary">Change Avatar</el-button>
        </el-upload>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {{ currentUser?.username || 'User Profile' }}
        </h1>
      </div>

      <!-- Profile Information Form -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
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
              <el-input v-model="form.username" disabled />
            </el-form-item>

            <el-form-item label="Email" prop="email">
              <el-input v-model="form.email" />
            </el-form-item>

            <el-form-item label="Phone" prop="phone">
              <el-input v-model="form.phone" maxlength="11" />
            </el-form-item>

            <el-form-item label="Status">
              <el-tag :type="currentStatusType">
                {{ currentStatusText }}
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
                v-model="form.comment"
                type="textarea"
                :rows="3"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <!-- Read-only Information -->
            <div
              class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400"
            >
              <div>
                <p class="mb-1">Last Login</p>
                <p class="font-medium">{{ getFormattedDateTime(currentUser?.login_date) }}</p>
              </div>
              <div>
                <p class="mb-1">Account Created</p>
                <p class="font-medium">{{ getFormattedDateTime(currentUser?.create_time) }}</p>
              </div>
              <div>
                <p class="mb-1">Last Updated</p>
                <p class="font-medium">{{ getFormattedDateTime(currentUser?.update_time) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Theme Settings -->
        <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Preferences</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <el-form-item label="Language">
              <el-select
                v-model="form.language"
                class="w-full"
                :popper-class="'custom-select-popper'"
                :teleported="false"
              >
                <el-option label="English" value="en" />
                <el-option label="中文" value="zh" />
              </el-select>
            </el-form-item>

            <el-form-item label="Theme">
              <el-select
                v-model="currentTheme"
                class="w-full"
                @change="onThemeChange"
                :popper-class="'custom-select-popper'"
                :teleported="false"
              >
                <el-option label="Light" :value="false" />
                <el-option label="Dark" :value="true" />
              </el-select>
            </el-form-item>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-4">
          <el-button @click="onReset">Reset</el-button>
          <el-button type="primary" @click="onSubmit" :loading="isLoading">
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

interface Form {
  username: string
  email: string | null
  phone: string | null
  comment: string | null
  language: string
}

const formRef = ref<FormInstance>()
const isLoading = ref(false)

const authStore = useAuthStore()
const themeStore = useThemeStore()

const currentUser = computed(() => authStore.user)
const currentTheme = computed({
  get: () => themeStore.isDarkMode,
  set: (value: boolean) => {
    if (value !== themeStore.isDarkMode) {
      themeStore.toggleDarkMode()
    }
  },
})

const formRules = {
  email: [
    {
      type: 'email' as const,
      message: 'Please enter a valid email address',
      trigger: 'blur' as const,
    },
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: 'Please enter a valid phone number',
      trigger: 'blur' as const,
    },
  ],
}

const form = reactive<Form>({
  username: currentUser.value?.username ?? '',
  email: currentUser.value?.email ?? null,
  phone: currentUser.value?.phone ?? null,
  comment: currentUser.value?.comment ?? null,
  language: 'en',
})

const currentStatusType = computed((): 'success' | 'danger' | 'info' => {
  switch (currentUser.value?.status) {
    case 1:
      return 'success'
    case 0:
      return 'danger'
    default:
      return 'info'
  }
})

const currentStatusText = computed((): string => {
  switch (currentUser.value?.status) {
    case 1:
      return 'Active'
    case 0:
      return 'Inactive'
    default:
      return 'Unknown'
  }
})

const getFormattedDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

const onThemeChange = (value: boolean): void => {
  currentTheme.value = value
}

const onReset = (): void => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
// Update onAvatarChange to be used in a more meaningful way
const onAvatarChange = async (uploadFile: UploadFile): Promise<void> => {
  isLoading.value = true
  try {
    const file = uploadFile.raw
    if (!file) {
      ElNotification({
        title: 'Error',
        message: 'No file selected',
        type: 'error',
      })
      return
    }
    // Will implement actual upload logic later
    // await uploadAvatar(file)
    ElNotification({
      title: 'Success',
      message: 'Avatar changed successfully',
      type: 'success',
    })
  } catch (err) {
    ElNotification({
      title: 'Error',
      message: `Failed to update avatar ${err instanceof Error ? err.message : ''}`,
      type: 'error',
    })
  } finally {
    isLoading.value = false
  }
}

// Update error handling in onSubmit
const onSubmit = async (): Promise<void> => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      isLoading.value = true
      try {
        // Save changes logic will be implemented later
        ElNotification({
          title: 'Success',
          message: 'Profile updated successfully',
          type: 'success',
        })
      } catch (err) {
        // Changed from error to err since we're using it
        ElNotification({
          title: 'Error',
          message: err instanceof Error ? err.message : 'Failed to update profile',
          type: 'error',
        })
      } finally {
        isLoading.value = false
      }
    }
  })
}
</script>
