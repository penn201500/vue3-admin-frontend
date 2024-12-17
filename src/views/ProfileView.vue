<template>
  <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
    <div class="max-w-4xl mx-auto">
      <!-- Profile Header -->
      <div class="mb-8 text-center">
        <div class="avatar-wrapper" tabindex="-1" aria-label="User avatar">
          <el-avatar :size="100" :src="avatarUrl" @error="() => true">
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
        ref="profileFormRef"
        :model="profileForm"
        :rules="profileRules"
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
                v-model="profileForm.comment"
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

        <!-- Profile Form Actions -->
        <div class="flex justify-end space-x-4">
          <el-button @click="onProfileReset">Reset</el-button>
          <el-button type="primary" @click="onProfileSubmit" :loading="isLoading">
            Save Changes
          </el-button>
        </div>
      </el-form>

      <!-- Password Update Section -->
      <div class="mt-8">
        <el-collapse>
          <el-collapse-item>
            <template #title>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Change Password
              </h2>
            </template>
            <el-form
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              label-position="top"
              class="mt-4"
            >
              <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <div class="space-y-4">
                  <el-form-item label="Current Password" prop="currentPassword">
                    <el-input
                      v-model="passwordForm.currentPassword"
                      type="password"
                      show-password
                    />
                  </el-form-item>

                  <el-form-item label="New Password" prop="newPassword">
                    <el-input v-model="passwordForm.newPassword" type="password" show-password />
                    <!-- Add password requirements display -->
                    <div class="mt-2 text-sm">
                      <div
                        v-for="(requirement, index) in passwordRequirements"
                        :key="index"
                        :class="[
                          'flex items-center space-x-1',
                          checkRequirement(requirement) ? 'text-green-500' : 'text-red-500',
                        ]"
                      >
                        <el-icon>
                          <Check v-if="checkRequirement(requirement)" />
                          <Close v-else />
                        </el-icon>
                        <span>{{ requirement.text }}</span>
                      </div>
                    </div>
                  </el-form-item>

                  <el-form-item label="Confirm New Password" prop="confirmPassword">
                    <el-input
                      v-model="passwordForm.confirmPassword"
                      type="password"
                      show-password
                    />
                    <!-- Add password match indicator -->
                    <div
                      v-if="passwordForm.confirmPassword && !formErrors.confirmPassword"
                      class="mt-2 text-sm"
                      :class="
                        passwordForm.confirmPassword === passwordForm.newPassword
                          ? 'text-green-500'
                          : 'text-red-500'
                      "
                    >
                      <div class="flex items-center space-x-1">
                        <el-icon>
                          <Check v-if="passwordForm.confirmPassword === passwordForm.newPassword" />
                          <Close v-else />
                        </el-icon>
                        <span>{{
                          passwordForm.confirmPassword === passwordForm.newPassword
                            ? 'Passwords match'
                            : 'Passwords do not match'
                        }}</span>
                      </div>
                    </div>
                  </el-form-item>
                </div>

                <!-- Password Form Actions -->
                <div class="flex justify-end space-x-4 mt-6">
                  <el-button @click="onPasswordReset">Reset</el-button>
                  <el-button type="primary" @click="onPasswordSubmit" :loading="isPasswordLoading">
                    Update Password
                  </el-button>
                </div>
              </div>
            </el-form>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { ElNotification } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import type { FormInstance, UploadFile } from 'element-plus'
import apiClient from '@/utils/apiClient'
import axios from 'axios'

// Interfaces
interface ProfileForm {
  username: string
  email: string | null
  phone: string | null
  comment: string | null
  language: string
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Refs
const profileFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const isLoading = ref(false)
const isPasswordLoading = ref(false)

// Store
const authStore = useAuthStore()

// Computed
const currentUser = computed(() => authStore.user)

// Form Rules
const profileRules = {
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

// Track form errors
const formErrors = reactive({
  confirmPassword: '',
})

// Update your password validation to update the formErrors
const validateConfirmPassword = (rule: any, value: string, callback: Function) => {
  if (value !== passwordForm.newPassword) {
    formErrors.confirmPassword = 'Passwords do not match'
    callback(new Error('Passwords do not match'))
  } else {
    formErrors.confirmPassword = ''
    callback()
  }
}

// Update password rules
const passwordRules = {
  currentPassword: [
    {
      required: true,
      message: 'Please enter your current password',
      trigger: 'blur',
    },
  ],
  newPassword: [
    {
      required: true,
      message: 'Please enter your new password',
      trigger: 'blur',
    },
    {
      validator: (rule: any, value: string, callback: Function) => {
        const failedRequirements = validatePasswordRequirements(value)
        if (failedRequirements.length > 0) {
          callback(new Error(`Password requirements not met:\n${failedRequirements.join('\n')}`))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change'],
    },
  ],
  confirmPassword: [
    {
      required: true,
      message: 'Please confirm your new password',
      trigger: 'blur',
    },
    {
      validator: validateConfirmPassword,
      trigger: ['blur', 'change'],
    },
  ],
}

// Forms
const profileForm = reactive<ProfileForm>({
  username: currentUser.value?.username ?? '',
  email: currentUser.value?.email ?? null,
  phone: currentUser.value?.phone ?? null,
  comment: currentUser.value?.comment ?? null,
  language: 'en',
})

const passwordForm = reactive<PasswordForm>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Status computeds
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

// Avatar
const avatarUrl = ref<string>('')

const fetchAvatar = async () => {
  try {
    const response = await apiClient.get('/user/api/profile/get-avatar/')
    if (response.data.code === 200) {
      avatarUrl.value = response.data.data.avatar_url
    }
  } catch (error) {
    // Silently fail for 404 (no avatar)
    if (axios.isAxiosError(error) && error.response?.status !== 404) {
      ElNotification({
        title: 'Error',
        message: 'Failed to load avatar',
        type: 'error',
      })
    }
  }
}

onMounted(() => {
  fetchAvatar()
})

// Utility functions
const getFormattedDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

// Form actions
const onProfileReset = (): void => {
  if (profileFormRef.value) {
    profileFormRef.value.resetFields()
  }
}

const onPasswordReset = (): void => {
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
}

// API calls and form submissions
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

    const formData = new FormData()
    formData.append('avatar', file)

    // Use apiClient instead of fetch
    const response = await apiClient.post('/user/api/profile/avatar/', formData, {
      headers: {
        // Override the default Content-Type for file upload
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.status === 200) {
      ElNotification({
        title: 'Success',
        message: 'Avatar changed successfully',
        type: 'success',
      })

      // Refetch avatar after successful upload
      await fetchAvatar()

      // Update the store with new avatar URL
      if (currentUser.value) {
        const currentToken = authStore.accessToken || ''
        const currentRememberMe = authStore.rememberMe || false

        authStore.setUser(
          {
            ...currentUser.value,
            avatar: response.data.data.avatar_url,
          },
          currentToken,
          currentRememberMe,
        )
      }
    } else {
      throw new Error(response.data.message || 'Failed to update avatar')
    }
  } catch (err) {
    ElNotification({
      title: 'Error',
      message: `Failed to update avatar: ${axios.isAxiosError(err) ? err.response?.data?.message || err.message : 'Unknown error'}`,
      type: 'error',
    })
  } finally {
    isLoading.value = false
  }
}

const onProfileSubmit = async (): Promise<void> => {
  if (!profileFormRef.value) return

  await profileFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      isLoading.value = true
      try {
        const response = await apiClient.patch('/user/api/profile/update/', {
          email: profileForm.email,
          phone: profileForm.phone,
          comment: profileForm.comment,
        })

        if (response.status === 200) {
          ElNotification({
            title: 'Success',
            message: 'Profile updated successfully',
            type: 'success',
          })

          // Update the store with new user data
          if (currentUser.value) {
            const currentToken = authStore.accessToken || ''
            const currentRememberMe = authStore.rememberMe || false

            authStore.setUser(
              {
                ...currentUser.value,
                email: response.data.data.email,
                phone: response.data.data.phone,
                comment: response.data.data.comment,
              },
              currentToken,
              currentRememberMe,
            )
          }
        }
      } catch (err) {
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

// Password validation rules
const validatePasswordRequirements = (password: string) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }

  const failedRequirements = Object.entries(requirements)
    .filter(([_, met]) => !met)
    .map(([req]) => {
      switch (req) {
        case 'minLength':
          return 'At least 8 characters'
        case 'hasUppercase':
          return 'At least one uppercase letter'
        case 'hasLowercase':
          return 'At least one lowercase letter'
        case 'hasNumber':
          return 'At least one number'
        case 'hasSpecial':
          return 'At least one special character'
        default:
          return ''
      }
    })

  return failedRequirements
}

const onPasswordSubmit = async (): Promise<void> => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      isPasswordLoading.value = true
      try {
        const response = await apiClient.post('/user/api/profile/password/', {
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
          confirm_password: passwordForm.confirmPassword,
        })

        if (response.status === 200) {
          ElNotification({
            title: 'Success',
            message: 'Password updated successfully',
            type: 'success',
          })

          // Reset password form after successful update
          passwordForm.currentPassword = ''
          passwordForm.newPassword = ''
          passwordForm.confirmPassword = ''

          // Reset form validation
          passwordFormRef.value?.resetFields()
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const errorMessage =
            err.response?.data?.errors?.password?.[0] ||
            err.response?.data?.message ||
            'Failed to update password'
          ElNotification({
            title: 'Error',
            message: errorMessage,
            type: 'error',
            duration: 5000,
          })
        }
      } finally {
        isPasswordLoading.value = false
      }
    }
  })
}

const passwordRequirements = [
  { test: (pw: string) => pw.length >= 8, text: 'At least 8 characters' },
  { test: (pw: string) => /[A-Z]/.test(pw), text: 'At least one uppercase letter' },
  { test: (pw: string) => /[a-z]/.test(pw), text: 'At least one lowercase letter' },
  { test: (pw: string) => /[0-9]/.test(pw), text: 'At least one number' },
  {
    test: (pw: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw),
    text: 'At least one special character',
  },
]

const checkRequirement = (requirement: { test: (pw: string) => boolean }) => {
  return requirement.test(passwordForm.newPassword)
}
</script>

<style>
.el-popper {
  position: fixed !important;
}
</style>
