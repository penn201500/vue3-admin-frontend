<template>
  <div class="bg-white dark:bg-gray-800">
    <!-- Main Container -->
    <div class="p-1">
      <!-- Search Bar Container -->
      <div class="w-full flex flex-col sm:flex-row justify-between items-center gap-2 mb-2">
        <div class="w-full sm:w-96">
          <el-input
            v-model="searchQuery"
            placeholder="Search by username, email, phone or comment..."
            clearable
            :loading="searchLoading"
            @clear="clearSearch"
            @input="handleSearch"
            @keyup.enter="handleEnterSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #suffix>
              <el-icon v-if="searchLoading" class="animate-spin">
                <Loading />
              </el-icon>
            </template>
          </el-input>
        </div>
        <!-- Only show Add User button for users with admin role -->
        <el-button v-if="hasAdminRole" type="primary" @click="handleAddUser">
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
              <el-avatar :size="36" :src="scope.row.avatar_url">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
            </template>
          </el-table-column>

          <el-table-column prop="username" label="Username" sortable="custom" />
          <!-- Add Role column after Username -->
          <el-table-column label="Roles" width="220">
            <template #default="scope">
              <div class="flex gap-1 flex-wrap">
                <el-tag
                  v-for="role in scope.row.roles"
                  :key="role.id"
                  :type="role.code === 'admin' ? 'danger' : 'info'"
                  size="small"
                  class="mr-1"
                >
                  {{ role.name }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="Email" width="200" sortable="custom" />
          <el-table-column prop="phone" width="120" label="Phone" />

          <el-table-column prop="status" label="Status" width="90" sortable="custom" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? 'Active' : 'Inactive' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="create_time" label="Created" sortable="custom" width="200">
            <template #default="scope">
              <span class="text-gray-600 dark:text-gray-400">
                {{ formatDateTime(scope.row.create_time) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="last_login" label="Last Login" sortable="custom" width="200">
            <template #default="scope">
              <span class="text-gray-600 dark:text-gray-400">
                {{ formatDateTime(scope.row.last_login) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="comment" label="Comment" min-width="200">
            <template #default="scope">
              <el-tooltip
                v-if="scope.row.comment && scope.row.comment.length > 20"
                :content="scope.row.comment"
                placement="top"
                :show-after="200"
              >
                <span class="text-gray-600 dark:text-gray-400">
                  {{ truncateText(scope.row.comment, 20) }}
                </span>
              </el-tooltip>
              <span v-else class="text-gray-600 dark:text-gray-400">
                {{ scope.row.comment || 'N/A' }}
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
                <!-- Only show delete button for users without admin role -->
                <el-button
                  v-if="!hasAdminRoleUser(scope.row)"
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
        <div class="flex justify-end mt-1">
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
                  <div class="font-medium truncate text-xs">
                    <el-tooltip
                      v-if="user.username && user.username.length > 12"
                      :content="user.username"
                      placement="top"
                      :show-after="200"
                    >
                      <span>{{ truncateText(user.username, 12) }}</span>
                    </el-tooltip>
                    <span v-else>{{ user.username || 'N/A' }}</span>
                  </div>
                  <div class="font-medium truncate text-xs mr-1">
                    <el-tooltip
                      v-if="user.email && user.email.length > 12"
                      :content="user.email"
                      placement="top"
                      :show-after="200"
                    >
                      <span>{{ truncateText(user.email, 12) }}</span>
                    </el-tooltip>
                    <span v-else>{{ user.email || 'N/A' }}</span>
                  </div>
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
                <div class="text-xs">{{ user.phone || 'N/A' }}</div>
              </div>
              <div>
                <div class="text-gray-500">Created</div>
                <div class="text-xs">{{ formatDateTime(user.create_time) }}</div>
              </div>
              <!-- Roles added here  -->
              <div>
                <div class="text-gray-500">Roles</div>
                <div class="flex gap-1 flex-wrap text-xs">
                  <el-tag
                    v-for="role in user.roles"
                    :key="role.id"
                    :type="role.code === 'admin' ? 'danger' : 'info'"
                    size="small"
                    class="mr-1"
                  >
                    {{ role.name }}
                  </el-tag>
                </div>
              </div>
              <div>
                <div class="text-gray-500">Last Login</div>
                <div class="text-xs">{{ formatDateTime(user.last_login) }}</div>
              </div>
              <div>
                <div class="text-gray-500">Comment</div>
                <div class="truncate text-xs">
                  <el-tooltip
                    v-if="user.comment && user.comment.length > 20"
                    :content="user.comment"
                    placement="top"
                    :show-after="200"
                  >
                    <span>{{ truncateText(user.comment, 20) }}</span>
                  </el-tooltip>
                  <span v-else>{{ user.comment || 'N/A' }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-2 pt-2 border-t dark:border-gray-700">
              <el-button type="primary" size="small" @click="handleEdit(user)">
                <el-icon class="mr-1"><Edit /></el-icon>Edit
              </el-button>
              <el-button
                v-if="!hasAdminRoleUser(user)"
                type="danger"
                :icon="Delete"
                size="small"
                @click="handleDelete(user)"
              >
                Delete
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { User } from '@/types/User'
import apiClient from '@/utils/apiClient'
import axios from 'axios'
import { Search, Plus, Edit, Delete, UserFilled, Loading } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/authStore'
import type { Role } from '@/types/Role'
import { useTabStore } from '@/stores/tabStore'
import { useRouter } from 'vue-router'

// Search
interface SearchParams {
  search?: string // General search term
  username?: string // Specific field searches
  email?: string
  phone?: string
  comment?: string
  ordering?: string // Keep existing ordering
  page?: number
  pageSize?: number
}
const searchQuery = ref('')
const searchTimeout = ref<number | null>(null)
const searchLoading = ref(false)

// Handle user edit
const router = useRouter()
const tabStore = useTabStore()

// State
const loading = ref(false)
const users = ref<User[]>([])
const currentSort = ref({
  prop: 'create_time',
  order: 'descending',
})

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const authStore = useAuthStore()

// Check if current user has admin role
const hasAdminRole = computed(() => {
  console.log('Checking admin role:', authStore.user)
  return authStore.user?.roles?.some((role: Role) => role.code === 'admin') ?? false
})

// Helper function to check if a user has admin role
const hasAdminRoleUser = (user: User) => {
  return user.roles.some((role: Role) => role.code === 'admin')
}

// Add controller for cleanup
const controller = new AbortController()

// Truncate if text is too long
const truncateText = (text: string | null, length: number): string => {
  if (!text) return 'N/A'
  return text.length > length ? `${text.slice(0, length)}...` : text
}

// Enhanced row styling function with stronger hover effect
const tableRowClassName = ({ rowIndex }: { rowIndex: number }) => {
  const baseClasses = 'transition-colors duration-150 !py-1'
  const hoverClasses = 'hover:bg-gray-100 dark:hover:bg-gray-700/90' // Darker hover effect

  return rowIndex % 2 === 0
    ? `${baseClasses} ${hoverClasses} bg-white dark:bg-gray-900`
    : `${baseClasses} ${hoverClasses} bg-green-50/30 dark:bg-gray-800/50`
}

// Methods for handling row actions
const handleEdit = (user: User) => {
  const tab = {
    id: `profile-${user.id}`,
    title: `${user.username}'s Profile`,
    path: `/user/profile/${user.id}`,
    component: 'userProfile',
    closeable: true,
  }
  tabStore.addTab(tab)
  tabStore.setActiveTab(tab.id)
  router.push(`/user/profile/${user.id}`)
}

const handleDelete = (row: User) => {
  console.log('Delete user:', row)
  // Implement delete logic
}

const handleAddUser = {}

// Implement the debounced search handler
const handleSearch = () => {
  if (searchTimeout.value) {
    window.clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = window.setTimeout(() => {
    searchLoading.value = true
    currentPage.value = 1 // Reset to first page when searching
    fetchUsers()
  }, 800) // 300ms debounce
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

    // Construct search parameters
    const params: SearchParams = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ordering,
    }

    // Add search term if exists
    if (searchQuery.value) {
      // Add search parameters for each field
      params.search = searchQuery.value // General search
      params.username = searchQuery.value
      params.email = searchQuery.value
      params.phone = searchQuery.value
      params.comment = searchQuery.value
    }

    const response = await apiClient.get('/user/api/users/', {
      params,
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
    searchLoading.value = false
  }
}

// Add immediate search handler for enter key
const handleEnterSearch = () => {
  if (searchTimeout.value) {
    window.clearTimeout(searchTimeout.value)
  }
  searchLoading.value = true
  currentPage.value = 1
  fetchUsers()
}

// Clear search
// Update the clear search function
const clearSearch = () => {
  searchQuery.value = ''
  searchLoading.value = true
  currentPage.value = 1
  fetchUsers()
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
  if (searchTimeout.value) {
    // Clean up search timeout
    window.clearTimeout(searchTimeout.value)
  }
  controller.abort() // Cancel any pending requests when component unmounts
})
</script>
