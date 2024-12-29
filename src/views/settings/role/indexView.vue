<template>
  <div class="bg-white dark:bg-gray-800">
    <!-- Main Container -->
    <div class="p-1">
      <!-- Desktop View (md and up) -->
      <div class="hidden md:block">
        <el-table
          v-loading="loading"
          :data="roles"
          :stripe="true"
          :border="true"
          class="w-full mb-4"
          :header-cell-class-name="'!text-gray-700 dark:!text-gray-200 !font-semibold'"
          :row-class-name="tableRowClassName"
          @sort-change="handleSortChange"
        >
          <el-table-column prop="name" label="Role Name" width="180" sortable="custom" />
          <el-table-column prop="code" label="Role Code" width="180" sortable="custom">
            <template #default="scope">
              <div class="flex items-center">
                <span>{{ scope.row.code }}</span>
                <el-tag v-if="scope.row.is_system" type="danger" size="small" class="ml-2">
                  System
                </el-tag>
              </div>
            </template>
          </el-table-column>

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

          <el-table-column prop="update_time" label="Updated" sortable="custom" width="200">
            <template #default="scope">
              <span class="text-gray-600 dark:text-gray-400">
                {{ formatDateTime(scope.row.update_time) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="remark" label="Comment" min-width="200">
            <template #default="scope">
              <el-tooltip
                v-if="scope.row.remark && scope.row.remark.length > 20"
                :content="scope.row.remark"
                placement="top"
                :show-after="200"
              >
                <span class="text-gray-600 dark:text-gray-400">
                  {{ truncateText(scope.row.remark, 20) }}
                </span>
              </el-tooltip>
              <span v-else class="text-gray-600 dark:text-gray-400">
                {{ scope.row.remark || 'N/A' }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="Actions" width="120" align="center">
            <template #default="scope">
              <el-tooltip
                v-if="scope.row.is_system"
                content="System roles cannot be modified"
                placement="top"
              >
                <div>
                  <el-button-group>
                    <el-button type="primary" :icon="Edit" size="small" disabled />
                    <el-button type="danger" :icon="Delete" size="small" disabled />
                  </el-button-group>
                </div>
              </el-tooltip>
              <el-button-group v-else>
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

      <!-- Mobile View -->
      <div class="md:hidden space-y-4">
        <div
          v-for="role in roles"
          :key="role.id"
          class="bg-white dark:bg-gray-900 rounded-lg shadow-sm"
        >
          <!-- Card Header -->
          <div class="p-4 border-b dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ role.name }}
                  <el-tag v-if="role.is_system" type="danger" size="small" class="ml-2">
                    System
                  </el-tag>
                </div>
                <div class="text-sm text-gray-500">{{ role.code }}</div>
              </div>
              <el-tag :type="role.status === 1 ? 'success' : 'danger'">
                {{ role.status === 1 ? 'Active' : 'Inactive' }}
              </el-tag>
            </div>
          </div>

          <!-- Card Content -->
          <div class="p-4">
            <div class="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <div class="text-gray-500">Created</div>
                <div>{{ formatDateTime(role.create_time) }}</div>
              </div>
              <div>
                <div class="text-gray-500">Updated</div>
                <div>{{ formatDateTime(role.update_time) }}</div>
              </div>
              <div class="col-span-2">
                <div class="text-gray-500">Comment</div>
                <div class="truncate">
                  <el-tooltip
                    v-if="role.remark && role.remark.length > 20"
                    :content="role.remark"
                    placement="top"
                    :show-after="200"
                  >
                    <span>{{ truncateText(role.remark, 20) }}</span>
                  </el-tooltip>
                  <span v-else>{{ role.remark || 'N/A' }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-2 pt-2 border-t dark:border-gray-700">
              <el-tooltip
                v-if="role.is_system"
                content="System roles cannot be modified"
                placement="top"
              >
                <div class="flex gap-2">
                  <el-button type="primary" size="small" disabled>
                    <el-icon class="mr-1"><Edit /></el-icon>Edit
                  </el-button>
                  <el-button type="danger" size="small" disabled>
                    <el-icon class="mr-1"><Delete /></el-icon>Delete
                  </el-button>
                </div>
              </el-tooltip>
              <template v-else>
                <el-button type="primary" size="small" @click="handleEdit(role)">
                  <el-icon class="mr-1"><Edit /></el-icon>Edit
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete(role)">
                  <el-icon class="mr-1"><Delete /></el-icon>Delete
                </el-button>
              </template>
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

    <!-- Role Form Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? 'Edit Role' : 'Add Role'"
      width="500px"
      destroy-on-close
    >
      <el-form ref="roleFormRef" :model="roleForm" :rules="roleRules" label-position="top">
        <el-form-item label="Role Name" prop="name">
          <el-input v-model="roleForm.name" placeholder="Enter role name" />
        </el-form-item>
        <el-form-item label="Role Code" prop="code">
          <el-input v-model="roleForm.code" placeholder="Enter role code" :disabled="isEditing" />
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-switch
            v-model="roleForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="Active"
            inactive-text="Inactive"
          />
        </el-form-item>
        <el-form-item label="Comment" prop="remark">
          <el-input
            v-model="roleForm.remark"
            type="textarea"
            rows="3"
            placeholder="Enter comment"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEditing ? 'Update' : 'Create' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Edit, Delete } from '@element-plus/icons-vue'
import apiClient from '@/utils/apiClient'
import type { Role } from '@/types/Role'

// State
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEditing = ref(false)
const roles = ref<Role[]>([])
const roleFormRef = ref<FormInstance>()

// Search
const searchQuery = ref('')
const searchTimeout = ref<number | null>(null)
const searchLoading = ref(false)

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const currentSort = ref({
  prop: 'create_time',
  order: 'descending',
})

// Form state
const roleForm = ref({
  id: null as number | null,
  name: '',
  code: '',
  status: 1,
  remark: '',
})

// Form validation rules
const roleRules = {
  name: [
    { required: true, message: 'Please enter role name', trigger: 'blur' },
    { min: 2, max: 30, message: 'Length should be 2 to 30 characters', trigger: 'blur' },
  ],
  code: [
    { required: true, message: 'Please enter role code', trigger: 'blur' },
    { min: 2, max: 100, message: 'Length should be 2 to 100 characters', trigger: 'blur' },
  ],
}

// Add controller for cleanup
const controller = new AbortController()

// Utility functions
const formatDateTime = (date: string | null): string => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString()
}

const truncateText = (text: string | null, length: number): string => {
  if (!text) return 'N/A'
  return text.length > length ? `${text.slice(0, length)}...` : text
}

// Enhanced row styling function with stronger hover effect
const tableRowClassName = ({ rowIndex }: { rowIndex: number }) => {
  const baseClasses = 'transition-colors duration-150 !py-1'
  const hoverClasses = 'hover:bg-gray-100 dark:hover:bg-gray-700/90'

  return rowIndex % 2 === 0
    ? `${baseClasses} ${hoverClasses} bg-white dark:bg-gray-900`
    : `${baseClasses} ${hoverClasses} bg-green-50/30 dark:bg-gray-800/50`
}

// CRUD Operations
const fetchRoles = async () => {
  loading.value = true
  try {
    let ordering = ''
    if (currentSort.value.prop) {
      ordering =
        currentSort.value.order === 'ascending'
          ? currentSort.value.prop
          : `-${currentSort.value.prop}`
    }

    // Construct params
    const params: Record<string, any> = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ordering,
    }

    // Add search term if exists
    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    const response = await apiClient.get('/role/api/roles/', { params })
    if (response.data.code === 200) {
      roles.value = response.data.data
      total.value = response.data.count || 0
    }
  } catch (error) {
    ElMessage.error('Failed to fetch roles')
    console.error(error)
  } finally {
    loading.value = false
    searchLoading.value = false
  }
}

const handleEdit = (role: Role) => {
  isEditing.value = true
  roleForm.value = {
    id: role.id,
    name: role.name,
    code: role.code,
    status: role.status,
    remark: role.remark || '',
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!roleFormRef.value) return

  await roleFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true
      try {
        const url = isEditing.value ? `/role/api/roles/${roleForm.value.id}/` : '/role/api/roles/'
        const method = isEditing.value ? 'put' : 'post'

        const response = await apiClient[method](url, roleForm.value)
        if (response.data.code === 200) {
          ElMessage.success(`Role ${isEditing.value ? 'updated' : 'created'} successfully`)
          dialogVisible.value = false
          await fetchRoles()
        }
      } catch (error) {
        ElMessage.error(`Failed to ${isEditing.value ? 'update' : 'create'} role`)
        console.error(error)
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleDelete = async (role: Role) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to delete this role? This action cannot be undone.',
      'Delete Role',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
      },
    )

    const response = await apiClient.delete(`/role/api/roles/${role.id}/`)
    if (response.data.code === 200) {
      ElMessage.success('Role deleted successfully')
      await fetchRoles()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to delete role')
      console.error(error)
    }
  }
}

// Sorting and pagination handlers
const handleSortChange = ({ prop, order }: { prop?: string; order?: string }) => {
  if (!prop || !order) {
    currentSort.value = {
      prop: 'create_time',
      order: 'descending',
    }
  } else {
    currentSort.value = { prop, order }
  }
  fetchRoles()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchRoles()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchRoles()
}

// Lifecycle hooks
onMounted(() => {
  fetchRoles()
})

onUnmounted(() => {
  if (searchTimeout.value) {
    window.clearTimeout(searchTimeout.value)
  }
  controller.abort() // Cancel any pending requests
})
</script>
