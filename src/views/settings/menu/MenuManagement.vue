<template>
  <div class="bg-white dark:bg-gray-800">
    <!-- Main Container -->
    <div class="p-1">
      <!-- Search Bar Container -->
      <div class="w-full flex flex-col sm:flex-row justify-between items-center gap-2 mb-2">
        <div class="w-full sm:w-96">
          <el-input
            v-model="searchQuery"
            placeholder="Search menus..."
            clearable
            :loading="loading"
            @clear="clearSearch"
            @input="handleSearch"
            @keyup.enter="handleEnterSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #suffix>
              <el-icon v-if="loading" class="animate-spin">
                <Loading />
              </el-icon>
            </template>
          </el-input>
        </div>

        <el-button type="primary" @click="handleAdd">
          <el-icon class="mr-2"><Plus /></el-icon>Add Menu
        </el-button>
      </div>

      <!-- Desktop View (md and up) -->
      <div class="hidden md:block">
        <menu-table
          :menus="filteredMenus"
          :loading="loading"
          @edit="handleEdit"
          @delete="handleDelete"
        />

        <!-- Desktop Pagination -->
        <div class="flex justify-end mt-4">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 50]"
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
          v-for="menu in flattenedMenus"
          :key="menu.id"
          class="bg-white dark:bg-gray-900 rounded-lg shadow-sm"
        >
          <!-- Card Header -->
          <div class="p-4 border-b dark:border-gray-700">
            <div class="flex items-center justify-between">
              <el-tag :type="menu.status === 1 ? 'success' : 'danger'">
                {{ menu.status === 1 ? 'Enabled' : 'Disabled' }}
              </el-tag>
            </div>
          </div>

          <!-- Card Content -->
          <div class="p-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div class="text-gray-500">Router Path</div>
                <div>{{ menu.path || '-' }}</div>
              </div>
              <div>
                <div class="text-gray-500">Component Path</div>
                <div>{{ menu.component || '-' }}</div>
              </div>
              <div>
                <div class="text-gray-500">Comment</div>
                <div class="truncate">{{ menu.remark || '-' }}</div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-2 pt-4 border-t dark:border-gray-700 mt-4">
              <el-button type="primary" size="small" @click="handleEdit(menu)">
                <el-icon class="mr-1"><Edit /></el-icon>Edit
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(menu)">
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

    <!-- Menu Form Dialog -->
    <menu-form
      v-model:visible="dialogVisible"
      :menu="currentMenu"
      :menu-list="menus"
      :loading="submitting"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, Loading, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'
import MenuTable from './MenuTable.vue'
import MenuForm from './MenuForm.vue'
import apiClient from '@/utils/apiClient'
import type { MenuItem } from '@/types/Menu'

// State
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const currentMenu = ref<MenuItem | null>(null)
const menus = ref<MenuItem[]>([])
const searchQuery = ref('')
// Pagination
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// For mobile menu items view
const flattenedMenus = computed(() => {
  const result: MenuItem[] = []
  const flattenMenu = (items: MenuItem[]) => {
    items.forEach((item) => {
      result.push(item)
      if (item.children?.length) {
        flattenMenu(item.children)
      }
    })
  }
  flattenMenu(filteredMenus.value)
  return result
})

// Search
const searchTimeout = ref<number | null>(null)
const searchLoading = ref(false)
const handleSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = window.setTimeout(() => {
    searchLoading.value = true
    currentPage.value = 1 // Reset to first page when searching
    fetchMenus()
  }, 800)
}

const handleEnterSearch = () => {
  if (searchTimeout.value) {
    window.clearTimeout(searchTimeout.value)
  }
  searchLoading.value = true
  currentPage.value = 1
  fetchMenus()
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  fetchMenus()
}

// Computed
const filteredMenus = computed(() => {
  if (!searchQuery.value) return menus.value

  const searchLower = searchQuery.value.toLowerCase()

  // Helper function to search recursively
  const searchInMenu = (menu: MenuItem): MenuItem | null => {
    // Check if current menu matches
    const matches =
      menu.name.toLowerCase().includes(searchLower) ||
      menu.path?.toLowerCase().includes(searchLower) ||
      menu.component?.toLowerCase().includes(searchLower) ||
      menu.perms?.toLowerCase().includes(searchLower) ||
      menu.remark?.toLowerCase().includes(searchLower)

    if (matches) return menu

    // Check children
    if (menu.children?.length) {
      const matchingChildren = menu.children
        .map(searchInMenu)
        .filter((child): child is MenuItem => child !== null)

      if (matchingChildren.length) {
        return {
          ...menu,
          children: matchingChildren,
        }
      }
    }

    return null
  }

  return menus.value.map(searchInMenu).filter((menu): menu is MenuItem => menu !== null)
})

// Pagination
const handleSizeChange = async (val: number) => {
  pageSize.value = val
  currentPage.value = 1 // Reset to first page when changing page size
  await fetchMenus()
}

const handleCurrentChange = async (val: number) => {
  currentPage.value = val
  await fetchMenus()
}

// API Methods
const fetchMenus = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
    }

    const response = await apiClient.get('/menu/api/menus/', { params })

    if (response.data.code === 200) {
      menus.value = response.data.data
      total.value = response.data.count || 0
    }
  } catch (error) {
    ElMessage.error('Failed to fetch menus')
    console.error('Error fetching menus:', error)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async (formData: Partial<MenuItem>) => {
  submitting.value = true
  try {
    const method = currentMenu.value ? 'put' : 'post'
    const url = currentMenu.value
      ? `/menu/api/menus/${currentMenu.value.id}/`
      : '/menu/api/menus/create/'

    const response = await apiClient[method](url, formData)

    if (response.data.code === 200) {
      // ElMessage.success(`Menu ${currentMenu.value ? 'updated' : 'created'} successfully`)
      ElNotification({
        title: 'Success',
        message: `Menu ${currentMenu.value ? 'updated' : 'created'} successfully`,
        type: 'success',
      })
      dialogVisible.value = false
      await fetchMenus()
    }
  } catch (error) {
    // ElMessage.error(`Failed to ${currentMenu.value ? 'update' : 'create'} menu`)
    ElNotification({
      title: 'Error',
      message: `Failed to ${currentMenu.value ? 'update' : 'create'} menu`,
      type: 'error',
    })
    console.error('Error submitting menu:', error)
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (menu: MenuItem) => {
  try {
    loading.value = true
    const response = await apiClient.delete(`/menu/api/menus/${menu.id}/`)

    if (response.data.code === 200) {
      // ElMessage.success('Menu deleted successfully')
      ElNotification({
        title: 'Success',
        message: 'Menu deleted successfully',
        type: 'success',
      })
      await fetchMenus()
    }
  } catch (error) {
    ElMessage.error('Failed to delete menu')
    console.error('Error deleting menu:', error)
  } finally {
    loading.value = false
  }
}

// Event Handlers
const handleAdd = () => {
  currentMenu.value = null
  dialogVisible.value = true
}

const handleEdit = (menu: MenuItem) => {
  currentMenu.value = menu
  dialogVisible.value = true
}

// Initialize
onMounted(() => {
  fetchMenus()
})
</script>
