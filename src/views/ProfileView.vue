<template>
  <div class="p-6 bg-white dark:bg-gray-800 min-h-screen">
    <div class="max-w-4xl mx-auto">
      <!-- Profile Header -->
      <div class="text-center mb-8">
        <div class="relative inline-block mb-4">
          <el-avatar
            :size="96"
            :src="avatarUrl"
            class="mb-2 ring-4 ring-gray-100 dark:ring-gray-700"
          >
            <el-icon><UserFilled /></el-icon>
          </el-avatar>
          <el-upload
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            @change="onAvatarChange"
          >
            <el-button
              type="primary"
              size="small"
              circle
              class="absolute bottom-0 right-0 shadow-lg"
            >
              <el-icon><Upload /></el-icon>
            </el-button>
          </el-upload>
        </div>
        <h1 class="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
          {{ profileForm.username }}
        </h1>
        <el-tag :type="currentStatusType" class="px-4 py-1 text-sm font-medium">
          {{ currentStatusText }}
        </el-tag>
      </div>

      <!-- Main Form -->
      <el-form
        ref="profileFormRef"
        :model="profileForm"
        :rules="profileRules"
        label-position="top"
        class="space-y-6"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Basic Information -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div class="flex items-center mb-4 text-gray-900 dark:text-white">
              <el-icon class="mr-2"><InfoFilled /></el-icon>
              <h2 class="text-xl font-semibold">Basic Information</h2>
            </div>

            <div class="space-y-4">
              <el-form-item label="Username" prop="username" class="mb-4">
                <el-input v-model="profileForm.username" disabled class="w-full">
                  <template #prefix>
                    <el-icon><User /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="Email" prop="email" class="mb-4">
                <el-input v-model="profileForm.email" class="w-full">
                  <template #prefix>
                    <el-icon><Message /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="Phone" prop="phone" class="mb-4">
                <el-input v-model="profileForm.phone" maxlength="11" class="w-full">
                  <template #prefix>
                    <el-icon><Phone /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </div>
          </div>

          <!-- Timeline -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div class="flex items-center mb-4 text-gray-900 dark:text-white">
              <el-icon class="mr-2"><Timer /></el-icon>
              <h2 class="text-xl font-semibold">Account Timeline</h2>
            </div>

            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <div
                  class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center"
                >
                  <el-icon class="text-blue-500"><Timer /></el-icon>
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">Account Created</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ getFormattedDateTime(currentUser?.create_time) }}
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div
                  class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center"
                >
                  <el-icon class="text-green-500"><User /></el-icon>
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">Last Login</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ getFormattedDateTime(currentUser?.last_login) }}
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-3">
                <div
                  class="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center"
                >
                  <el-icon class="text-purple-500"><Edit /></el-icon>
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">Last Updated</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ getFormattedDateTime(currentUser?.update_time) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Information -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 md:col-span-2">
            <div class="flex items-center mb-4 text-gray-900 dark:text-white">
              <el-icon class="mr-2"><Comment /></el-icon>
              <h2 class="text-xl font-semibold">Additional Information</h2>
            </div>

            <el-form-item label="Comment" prop="comment">
              <el-input
                v-model="profileForm.comment"
                type="textarea"
                :rows="4"
                maxlength="500"
                show-word-limit
                resize="none"
                class="w-full"
                placeholder="Add your comment here..."
              />
            </el-form-item>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-center space-x-2 mt-6">
          <el-button @click="onProfileReset" :disabled="!isFormDirty">
            <span class="hidden sm:inline">Reset Changes</span>
            <span class="sm:hidden">Reset</span>
          </el-button>
          <el-button
            type="primary"
            @click="onProfileSubmit"
            :loading="isLoading"
            :disabled="!canSubmit"
          >
            <template v-if="isLoading">
              <span class="hidden sm:inline">Saving Changes...</span>
              <span class="sm:hidden">Saving...</span>
            </template>
            <template v-else>
              <span class="hidden sm:inline">Save Changes</span>
              <span class="sm:hidden">Save</span>
            </template>
          </el-button>
        </div>
      </el-form>

      <!-- Password Section -->
      <div class="mt-8">
        <el-collapse>
          <el-collapse-item>
            <template #title>
              <div class="flex items-center text-gray-900 dark:text-white">
                <el-icon class="mr-2"><Lock /></el-icon>
                <span class="text-xl font-semibold">Password</span>
              </div>
            </template>

            <el-form
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              label-position="top"
              class="mt-4"
            >
              <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg space-y-6">
                <!-- Current Password -->
                <el-form-item label="Current Password" prop="currentPassword" class="mb-4">
                  <el-input
                    v-model="passwordForm.currentPassword"
                    type="password"
                    show-password
                    class="w-full"
                  >
                    <template #prefix>
                      <el-icon><Key /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <!-- New Password with Requirements -->
                <div class="space-y-4">
                  <el-form-item label="New Password" prop="newPassword" class="mb-2">
                    <el-input
                      v-model="passwordForm.newPassword"
                      type="password"
                      show-password
                      class="w-full"
                    >
                      <template #prefix>
                        <el-icon><Lock /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>

                  <!-- Password Requirements -->
                  <div class="bg-white dark:bg-gray-800 p-4 rounded-lg space-y-2">
                    <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password Requirements
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div
                        v-for="requirement in passwordRequirements"
                        :key="requirement.text"
                        class="flex items-center space-x-2"
                      >
                        <el-icon
                          class="text-lg"
                          :class="[
                            checkRequirement(requirement) ? 'text-green-500' : 'text-gray-400',
                          ]"
                        >
                          <Check v-if="checkRequirement(requirement)" />
                          <Close v-else />
                        </el-icon>
                        <span
                          class="text-sm"
                          :class="[
                            checkRequirement(requirement)
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-600 dark:text-gray-400',
                          ]"
                        >
                          {{ requirement.text }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Confirm Password -->
                <el-form-item label="Confirm New Password" prop="confirmPassword" class="mb-4">
                  <el-input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    show-password
                    class="w-full"
                  >
                    <template #prefix>
                      <el-icon><Lock /></el-icon>
                    </template>
                  </el-input>

                  <!-- Password Match Indicator -->
                  <div
                    v-if="passwordForm.confirmPassword"
                    class="mt-2 flex items-center space-x-2"
                    :class="[
                      passwordForm.confirmPassword === passwordForm.newPassword
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400',
                    ]"
                  >
                    <el-icon class="text-lg">
                      <Check v-if="passwordForm.confirmPassword === passwordForm.newPassword" />
                      <Close v-else />
                    </el-icon>
                    <span class="text-sm">
                      {{
                        passwordForm.confirmPassword === passwordForm.newPassword
                          ? 'Passwords match'
                          : 'Passwords do not match'
                      }}
                    </span>
                  </div>
                </el-form-item>

                <!-- Form Actions -->
                <div
                  class="flex justify-center space-x-2 pt-4 border-t border-gray-200 dark:border-gray-600"
                >
                  <el-button @click="onPasswordReset">
                    <span class="hidden sm:inline">Reset Changes</span>
                    <span class="sm:hidden">Reset</span>
                  </el-button>
                  <el-button
                    type="primary"
                    @click="onPasswordSubmit"
                    :loading="isPasswordLoading"
                    :disabled="!isPasswordFormValid"
                  >
                    <template v-if="isPasswordLoading">
                      <span class="hidden sm:inline">Updating Password...</span>
                      <span class="sm:hidden">Updating...</span>
                    </template>
                    <template v-else>
                      <span class="hidden sm:inline">Update Password</span>
                      <span class="sm:hidden">Update</span>
                    </template>
                  </el-button>
                </div>
              </div>
            </el-form>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- Role Management Section -->
      <div class="mt-8">
        <el-collapse>
          <el-collapse-item>
            <template #title>
              <div class="flex items-center text-gray-900 dark:text-white">
                <el-icon class="mr-2"><UserFilled /></el-icon>
                <span class="text-xl font-semibold">Roles</span>
              </div>
            </template>

            <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <!-- Role Selection Area -->
              <div class="space-y-4">
                <div class="mb-4">
                  <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Available Roles
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Select at least one role. Your current roles are highlighted.
                  </p>
                </div>

                <!-- Role Checkboxes -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <template v-for="role in availableRoles" :key="role.id">
                    <div
                      class="bg-white dark:bg-gray-800 rounded-lg p-4"
                      :class="[
                        selectedRoles.includes(role.id)
                          ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                          : 'ring-1 ring-gray-200 dark:ring-gray-700',
                      ]"
                    >
                      <el-checkbox
                        v-model="selectedRoles"
                        :label="role.id"
                        :disabled="role.code === 'admin' && !canManageAdminRole"
                      >
                        <span
                          class="ml-2 font-medium"
                          :class="{
                            'text-red-600 dark:text-red-400': role.code === 'admin',
                          }"
                          >{{ role.name }}</span
                        >
                      </el-checkbox>
                    </div>
                  </template>
                </div>

                <!-- Warning Message -->
                <div
                  v-if="showRoleWarning"
                  class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                >
                  <div class="flex">
                    <el-icon class="text-yellow-400 mr-2"><Warning /></el-icon>
                    <div class="text-sm text-yellow-700 dark:text-yellow-200">
                      Please select at least one role to continue.
                    </div>
                  </div>
                </div>

                <!-- Form Actions -->
                <div
                  class="flex justify-center space-x-2 pt-4 border-t border-gray-200 dark:border-gray-600"
                >
                  <el-button @click="onRolesReset">
                    <span class="hidden sm:inline">Reset Changes</span>
                    <span class="sm:hidden">Reset</span>
                  </el-button>
                  <el-button
                    type="primary"
                    @click="onRolesSave"
                    :loading="isRolesSaving"
                    :disabled="!canSaveRoles"
                  >
                    <template v-if="isRolesSaving">
                      <span class="hidden sm:inline">Saving Changes...</span>
                      <span class="sm:hidden">Saving...</span>
                    </template>
                    <template v-else>
                      <span class="hidden sm:inline">Save Changes</span>
                      <span class="sm:hidden">Save</span>
                    </template>
                  </el-button>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { ElNotification } from 'element-plus'
import type { FormInstance, UploadFile } from 'element-plus'
import apiClient from '@/utils/apiClient'
import axios from 'axios'
import {
  Check,
  Close,
  UserFilled,
  InfoFilled,
  Upload,
  Timer,
  Comment,
  Lock,
  Key,
  Edit,
  User,
  Message,
  Phone,
} from '@element-plus/icons-vue'
import type { Role } from '@/types/Role'

const controller = new AbortController()

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

interface PasswordRequirement {
  test: (pw: string) => boolean
  text: string
}

interface FormRule {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change' | ('blur' | 'change')[]
  validator?: (rule: unknown, value: string, callback: (error?: Error) => void) => void
  type?: string
  pattern?: RegExp
}

// Refs
const profileFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const isLoading = ref(false)
const isPasswordLoading = ref(false)

// For role management
const availableRoles = ref<Role[]>([])
const selectedRoles = ref<number[]>([])
const initialRoles = ref<number[]>([])
const canManageAdminRole = computed(() => {
  return currentUser.value?.roles?.some((role) => role.code === 'admin') ?? false
})
const hasRolesChanged = computed(() => {
  if (selectedRoles.value.length !== initialRoles.value.length) return true
  return selectedRoles.value.some((roleId) => !initialRoles.value.includes(roleId))
})
const canSaveRoles = computed(() => {
  return hasRolesChanged.value && selectedRoles.value.length > 0
})
const fetchAvailableRoles = async () => {
  try {
    const response = await apiClient.get('/role/api/roles/')
    if (response.data.code === 200) {
      availableRoles.value = response.data.data
      // Initialize selected roles
      if (currentUser.value?.roles) {
        selectedRoles.value = currentUser.value.roles.map((role) => role.id)
        initialRoles.value = [...selectedRoles.value]
      }
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      ElNotification({
        title: 'Error',
        message: `Failed to fetch roles: ${error.response?.data?.message || error.message}`,
        type: 'error',
      })
    }
  }
}
const onRolesSave = async () => {
  if (selectedRoles.value.length === 0) {
    ElNotification({
      title: 'Warning',
      message: 'Please select at least one role',
      type: 'warning',
    })
    return
  }

  try {
    const response = await apiClient.post('/user/api/profile/roles/', {
      roles: selectedRoles.value,
    })

    if (response.data.code === 200) {
      ElNotification({
        title: 'Success',
        message: 'Roles updated successfully',
        type: 'success',
      })

      initialRoles.value = [...selectedRoles.value]

      // Update user in store
      if (currentUser.value) {
        authStore.setUser(
          {
            ...currentUser.value,
            roles: response.data.data.roles,
          },
          authStore.accessToken as string,
          authStore.rememberMe,
        )
      }
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      ElNotification({
        title: 'Error',
        message: `Failed to update roles: ${error.response?.data?.message || error.message}`,
        type: 'error',
      })
    }
  }
}
const showRoleWarning = computed(() => {
  return selectedRoles.value.length === 0
})

const onRolesReset = () => {}
const isRolesSaving = false

// Store
const authStore = useAuthStore()

// Computed
const currentUser = computed(() => authStore.user)

// Original user data from the store
const originalForm = ref({
  email: currentUser.value?.email ?? null,
  phone: currentUser.value?.phone ?? null,
  comment: currentUser.value?.comment ?? null,
})

// Compute if form is dirty (has changes) and valid
const isFormDirty = computed(() => {
  return (
    profileForm.email !== originalForm.value.email ||
    profileForm.phone !== originalForm.value.phone ||
    profileForm.comment !== originalForm.value.comment
  )
})

// Determine if save button should be enabled
const canSubmit = computed(() => {
  return isFormDirty.value && !isLoading.value
})

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

// For password button state
const isPasswordFormValid = computed(() => {
  return (
    passwordForm.currentPassword &&
    passwordForm.newPassword &&
    passwordForm.confirmPassword &&
    passwordForm.newPassword === passwordForm.confirmPassword &&
    passwordRequirements.every((req) => checkRequirement(req))
  )
})

// Update your password validation to update the formErrors
const validateConfirmPassword = (
  rule: unknown,
  value: string,
  callback: (error?: Error) => void,
) => {
  // Always call callback() without error to prevent Element Plus error display
  // The matching status will be shown by our custom indicator
  callback()
}

// Update password rules
const passwordRules: Record<string, FormRule[]> = {
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
      validator: (rule: unknown, value: string, callback: (error?: Error) => void) => {
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
    const response = await apiClient.get('/user/api/profile/get-avatar/', {
      signal: controller.signal,
    })
    if (response.data.code === 200) {
      avatarUrl.value = response.data.data.avatar_url
    }
  } catch (error) {
    // Only show error if it's not an abort error
    if (axios.isCancel(error)) {
      return
    }
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

// Fetch full user profile on component mount
const fetchUserProfile = async () => {
  try {
    const response = await apiClient.get('/user/api/user-info/', {
      signal: controller.signal,
    })
    if (response.data.code === 200) {
      // Update store with full user data while keeping existing token and rememberMe
      authStore.setUser(response.data.data, authStore.accessToken as string, authStore.rememberMe)

      // Update local form data
      profileForm.username = response.data.data.username
      profileForm.email = response.data.data.email
      profileForm.phone = response.data.data.phone
      profileForm.comment = response.data.data.comment

      // Update original form data for comparison
      originalForm.value = {
        email: response.data.data.email,
        phone: response.data.data.phone,
        comment: response.data.data.comment,
      }
    }
  } catch (error) {
    // Only show error if it's not an abort error
    if (axios.isCancel(error)) {
      return
    }
    if (axios.isAxiosError(error)) {
      ElNotification({
        title: 'Error',
        message: `Failed to load user profile ${axios.isAxiosError(error) ? error.response?.data?.message : ''}`,
        type: 'error',
      })
    }
  }
}

onMounted(async () => {
  await fetchAvailableRoles()
  await fetchUserProfile()
  await fetchAvatar()
})

onUnmounted(() => {
  controller.abort() // Cancel any pending requests
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, met]: [string, boolean]) => !met)
    .map(([req]: [string, boolean]) => {
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

const passwordRequirements: PasswordRequirement[] = [
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
