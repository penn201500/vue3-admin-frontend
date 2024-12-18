<template>
  <div class="p-6 min-h-screen bg-white dark:bg-gray-800">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
      </div>

      <!-- Table Card -->
      <div class="bg-white dark:bg-gray-900 rounded-lg shadow">
        <el-table
          v-loading="loading"
          :data="users"
          class="w-full"
          :header-cell-class-name="'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200'"
          :cell-class-name="'text-gray-800 dark:text-gray-300'"
          :border="true"
          @sort-change="handleSortChange"
        >
          <el-table-column label="Avatar" width="80" align="center">
            <template #default="{ row }">
              <el-avatar
                :size="40"
                :src="row.avatar"
                class="ring-2 ring-gray-100 dark:ring-gray-700"
              >
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
            </template>
          </el-table-column>

          <el-table-column prop="username" label="Username" sortable="custom" min-width="120">
            <template #default="{ row }">
              <span class="font-medium">{{ row.username }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="email" label="Email" sortable="custom" min-width="180" />

          <el-table-column prop="phone" label="Phone" min-width="120" />

          <el-table-column
            prop="status"
            label="Status"
            width="120"
            sortable="custom"
            align="center"
          >
            <template #default="{ row }">
              <el-tag
                :type="row.status === 1 ? 'success' : 'danger'"
                class="px-3 py-1"
                effect="plain"
              >
                {{ row.status === 1 ? 'Active' : 'Inactive' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="create_time" label="Created" sortable="custom" width="180">
            <template #default="{ row }">
              <span class="text-gray-600 dark:text-gray-400">
                {{ formatDateTime(row.create_time) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="last_login" label="Last Login" sortable="custom" width="180">
            <template #default="{ row }">
              <span class="text-gray-600 dark:text-gray-400">
                {{ formatDateTime(row.last_login) }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import type { User } from '@/types/User'
import apiClient from '@/utils/apiClient'

// State
const loading = ref(false)
const users = ref<User[]>([])
const currentSort = ref({
  prop: 'create_time',
  order: 'descending',
})

// Methods
const formatDateTime = (date: string | null): string => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString()
}

const fetchUsers = async () => {
  loading.value = true
  try {
    // Convert Element Plus sort params to backend format
    let ordering = ''
    if (currentSort.value.prop) {
      ordering =
        currentSort.value.order === 'ascending'
          ? currentSort.value.prop
          : `-${currentSort.value.prop}`
    }

    const response = await apiClient.get('/user/api/users/', {
      params: ordering ? { ordering } : undefined,
    })

    if (response.data.code === 200) {
      users.value = response.data.data
    } else {
      throw new Error(response.data.message)
    }
  } catch (error) {
    ElMessage.error('Failed to fetch users')
    console.error(error)
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

// Lifecycle
onMounted(() => {
  fetchUsers()
})
</script>
