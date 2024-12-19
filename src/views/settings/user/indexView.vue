<template>
  <div class="min-h-screen bg-white dark:bg-gray-800">
    <!-- Main Container -->
    <div class="p-4 sm:p-6">
      <!-- Search Bar Container -->
      <div class="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
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
        <el-button type="primary">
          <el-icon class="mr-2"><Plus /></el-icon>
          Add User
        </el-button>
      </div>

      <!-- Desktop View (md and up) -->
      <div class="hidden md:block">
        <el-table
          v-loading="loading"
          :data="users"
          :stripe="true"
          :border="true"
          class="w-full mb-4"
          :header-cell-class-name="'!text-gray-700 dark:!text-gray-200 !font-semibold'"
          :row-class-name="tableRowClassName"
          @sort-change="handleSortChange"
        >
          <!-- Original table columns -->
          <el-table-column label="Avatar" width="80" align="center">
            <template #default="scope">
              <el-avatar :size="40" :src="scope.row.avatar_url">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
            </template>
          </el-table-column>

          <el-table-column prop="username" label="Username" sortable="custom" />
          <el-table-column prop="email" label="Email" sortable="custom" />
          <el-table-column prop="phone" label="Phone" />

          <el-table-column
            prop="status"
            label="Status"
            width="120"
            sortable="custom"
            align="center"
          >
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? 'Active' : 'Inactive' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="create_time" label="Created" sortable="custom">
            <template #default="scope">
              <span class="text-gray-600 dark:text-gray-400">
                {{ formatDateTime(scope.row.create_time) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="last_login" label="Last Login" sortable="custom">
            <template #default="scope">
              <span class="text-gray-600 dark:text-gray-400">
                {{ formatDateTime(scope.row.last_login) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="Actions" width="120" align="center">
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
        <!-- Desktop Pagination -->
        <div class="flex justify-end mt-4">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- Mobile View (sm and down) -->
      <div class="md:hidden space-y-4">
        <div
          v-for="user in users"
          :key="user.id"
          class="bg-white dark:bg-gray-900 rounded-lg shadow-sm"
        >
          <!-- Card Header -->
          <div class="p-4 border-b dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <el-avatar :size="40" :src="user.avatar_url">
                  <el-icon><UserFilled /></el-icon>
                </el-avatar>
                <div>
                  <div class="font-medium">{{ user.username }}</div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                </div>
              </div>
              <el-tag :type="user.status === 1 ? 'success' : 'danger'">
                {{ user.status === 1 ? 'Active' : 'Inactive' }}
              </el-tag>
            </div>
          </div>

          <!-- Card Content -->
          <div class="p-4">
            <div class="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <div class="text-gray-500">Phone</div>
                <div>{{ user.phone || 'N/A' }}</div>
              </div>
              <div>
                <div class="text-gray-500">Created</div>
                <div>{{ formatDateTime(user.create_time) }}</div>
              </div>
              <div>
                <div class="text-gray-500">Last Login</div>
                <div>{{ formatDateTime(user.last_login) }}</div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-2 pt-2 border-t dark:border-gray-700">
              <el-button type="primary" size="small" @click="handleEdit(user)">
                <el-icon class="mr-1"><Edit /></el-icon>Edit
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(user)">
                <el-icon class="mr-1"><Delete /></el-icon>Delete
              </el-button>
            </div>
          </div>
        </div>
        <!-- Mobile Pagination -->
        <div class="flex justify-center mt-6">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            @current-change="handleCurrentChange"
          />
        </div>
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

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

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
      params: {
        ordering,
        page: currentPage.value,
        pageSize: pageSize.value,
      },
      signal: controller.signal,
    })

    if (response.data.code === 200) {
      // Store users first
      users.value = response.data.data
      total.value = response.data.count // Total count from backend

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

// Pagination handlers
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchUsers()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
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
