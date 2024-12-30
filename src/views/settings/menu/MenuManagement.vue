<template>
  <div class="bg-white dark:bg-gray-800 min-h-screen p-4">
    <!-- Header Actions -->
    <div class="flex justify-between items-center mb-4">
      <el-input
        v-model="searchQuery"
        placeholder="Search menus..."
        clearable
        class="w-80"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-button type="primary" @click="handleAdd">
        <el-icon class="mr-2"><Plus /></el-icon>Add Menu
      </el-button>
    </div>

    <!-- Menu Table -->
    <menu-table
      :menus="filteredMenus"
      :loading="loading"
      @edit="handleEdit"
      @delete="handleDelete"
      @drop="handleDrop"
    />

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
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import MenuTable from './MenuTable.vue'
import apiClient from '@/utils/apiClient'
import type { MenuItem } from '@/types/Menu'


// State
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const currentMenu = ref<MenuItem | null>(null)
const menus = ref<MenuItem[]>([])
const searchQuery = ref('')

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
      menu.perms?.toLowerCase().includes(searchLower)

    if (matches) return menu

    // Check children
    if (menu.children?.length) {
      const matchingChildren = menu.children
        .map(searchInMenu)
        .filter((child): child is MenuItem => child !== null)

      if (matchingChildren.length) {
        return {
          ...menu,
          children: matchingChildren
        }
      }
    }

    return null
  }

  return menus.value
    .map(searchInMenu)
    .filter((menu): menu is MenuItem => menu !== null)
})

// API Methods
const fetchMenus = async () => {
  loading.value = true
  try {
    const response = await apiClient.get('/menu/api/menus/')
    if (response.data.code === 200) {
      menus.value = response.data.data
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
      ElMessage.success(`Menu ${currentMenu.value ? 'updated' : 'created'} successfully`)
      dialogVisible.value = false
      await fetchMenus()
    }
  } catch (error) {
    ElMessage.error(`Failed to ${currentMenu.value ? 'update' : 'create'} menu`)
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
      ElMessage.success('Menu deleted successfully')
      await fetchMenus()
    }
  } catch (error) {
    ElMessage.error('Failed to delete menu')
    console.error('Error deleting menu:', error)
  } finally {
    loading.value = false
  }
}

const handleDrop = async ({ dragNode, dropNode, type }: {
  dragNode: MenuItem
  dropNode: MenuItem
  type: 'inner' | 'before' | 'after'
}) => {
  try {
    loading.value = true

    let newParentId = dropNode.parent_id
    let newOrderNum = dropNode.order_num

    if (type === 'inner') {
      newParentId = dropNode.id
      newOrderNum = (dropNode.children?.length || 0)
    } else if (type === 'before') {
      newOrderNum = dropNode.order_num
    } else {
      newOrderNum = dropNode.order_num + 1
    }

    const response = await apiClient.put(`/menu/api/menus/${dragNode.id}/`, {
      parent_id: newParentId,
      order_num: newOrderNum
    })

    if (response.data.code === 200) {
      ElMessage.success('Menu position updated')
      await fetchMenus()
    }
  } catch (error) {
    ElMessage.error('Failed to update menu position')
    console.error('Error updating menu position:', error)
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
