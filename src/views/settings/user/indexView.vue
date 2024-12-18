<template>
  <div class="p-4 sm:p-6 min-h-screen bg-white dark:bg-gray-800">
    <!-- Header with Search - Reduced top margin -->
    <div
      class="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4"
    >
      <div class="w-full sm:w-96">
        <el-input
          v-model="searchQuery"
          placeholder="Search users..."
          clearable
          @clear="handleSearch"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <el-button type="primary" class="w-full sm:w-auto">
        <el-icon class="mr-2"><Plus /></el-icon>
        Add User
      </el-button>
    </div>

    <!-- Table Container with Horizontal Scroll -->
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow">
      <div class="overflow-x-auto">
        <el-table
          v-loading="loading"
          :data="users"
          :stripe="true"
          :border="true"
          class="w-full"
          :header-cell-class-name="'!text-gray-700 dark:!text-gray-200 !font-semibold'"
          :row-class-name="tableRowClassName"
          @sort-change="handleSortChange"
        >
          <el-table-column label="Avatar" width="80" align="center" fixed="left">
            <template #default="scope">
              <el-avatar
                :size="40"
                :src="scope.row.avatar_url"
                class="ring-2 ring-gray-100 dark:ring-gray-700"
              >
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
            </template>
          </el-table-column>

          <el-table-column
            prop="username"
            label="Username"
            sortable="custom"
            min-width="120"
            fixed="left"
          >
            <template #default="scope">
              <span class="font-medium">{{ scope.row.username }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="email" label="Email" sortable="custom" min-width="180" />

          <el-table-column prop="phone" label="Phone" min-width="120" />

          <el-table-column
            prop="status"
            label="Status"
            width="100"
            sortable="custom"
            align="center"
          >
            <template #default="scope">
              <el-tag
                :type="scope.row.status === 1 ? 'success' : 'danger'"
                class="px-2 py-1"
                effect="light"
              >
                {{ scope.row.status === 1 ? 'Active' : 'Inactive' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="create_time" label="Created" sortable="custom" min-width="160">
            <template #default="scope">
              <span class="text-gray-600 dark:text-gray-400">
                {{ formatDateTime(scope.row.create_time) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="last_login" label="Last Login" sortable="custom" min-width="160">
            <template #default="scope">
              <span class="text-gray-600 dark:text-gray-400">
                {{ formatDateTime(scope.row.last_login) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="Actions" width="120" fixed="right" align="center">
            <template #default="scope">
              <el-button-group>
                <el-button
                  type="primary"
                  :icon="Edit"
                  size="small"
                  @click="handleEdit(scope.row)"
                />
                <el-button
                  type="danger"
                  :icon="Delete"
                  size="small"
                  @click="handleDelete(scope.row)"
                />
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { User } from '@/types/User'
import apiClient from '@/utils/apiClient'
import axios from 'axios'
import { Search, Plus, Edit, Delete, UserFilled } from '@element-plus/icons-vue'

// State
const loading = ref(false)
const users = ref<User[]>([])
const currentSort = ref({
  prop: 'create_time',
  order: 'descending',
})
const searchQuery = ref('')

// Add controller for cleanup
const controller = new AbortController()

// Enhanced row styling function with stronger hover effect
const tableRowClassName = ({ rowIndex }: { rowIndex: number }) => {
  const baseClasses = 'transition-colors duration-150'
  const hoverClasses = 'hover:bg-gray-100 dark:hover:bg-gray-700/90' // Darker hover effect

  return rowIndex % 2 === 0
    ? `${baseClasses} ${hoverClasses} bg-white dark:bg-gray-900`
    : `${baseClasses} ${hoverClasses} bg-green-50/30 dark:bg-gray-800/50`
}

// Methods for handling row actions
const handleEdit = (row: User) => {
  console.log('Edit user:', row)
  // Implement edit logic
}

const handleDelete = (row: User) => {
  console.log('Delete user:', row)
  // Implement delete logic
}

const handleSearch = () => {
  // Implement search functionality
  // This will be implemented in the next feature
}

const formatDateTime = (date: string | null): string => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString()
}

const fetchUserAvatar = async (userId: number) => {
  try {
    const response = await apiClient.get('/user/api/profile/get-avatar/', {
      params: { user_id: userId },
      signal: controller.signal,
    })
    if (response.data.code === 200) {
      return response.data.data.avatar_url
    }
  } catch (error) {
    if (!axios.isCancel(error)) {
      console.error(`Failed to fetch avatar for user ${userId}:`, error)
    }
    return null
  }
}

const fetchUsers = async () => {
  loading.value = true
  try {
    let ordering = ''
    if (currentSort.value.prop) {
      ordering =
        currentSort.value.order === 'ascending'
          ? currentSort.value.prop
          : `-${currentSort.value.prop}`
    }

    const response = await apiClient.get('/user/api/users/', {
      params: ordering ? { ordering } : undefined,
      signal: controller.signal,
    })

    if (response.data.code === 200) {
      // Store users first
      users.value = response.data.data

      // Fetch avatars for all users
      const avatarPromises = users.value.map((user) =>
        fetchUserAvatar(user.id).then((avatarUrl) => {
          const userIndex = users.value.findIndex((u) => u.id === user.id)
          if (userIndex !== -1) {
            users.value[userIndex] = {
              ...users.value[userIndex],
              avatar_url: avatarUrl,
            }
          }
        }),
      )

      await Promise.all(avatarPromises)
    }
  } catch (error) {
    if (!axios.isCancel(error)) {
      ElMessage.error('Failed to fetch users')
      console.error(error)
    }
  } finally {
    loading.value = false
  }
}

const handleSortChange = ({ prop, order }: { prop?: string; order?: string }) => {
  if (!prop || !order) {
    currentSort.value = {
      prop: 'create_time',
      order: 'descending',
    }
  } else {
    currentSort.value = { prop, order }
  }
  fetchUsers()
}

// Lifecycle hooks
onMounted(() => {
  fetchUsers()
})

onUnmounted(() => {
  controller.abort() // Cancel any pending requests when component unmounts
})
</script>
