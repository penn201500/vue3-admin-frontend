<template>
    <el-dialog
      v-model="dialogVisible"
      title="Role Menus"
      width="500px"
      :close-on-click-modal="false"
      @closed="handleClose"
    >
      <div class="w-full px-4">
        <el-tree
          ref="treeRef"
          :data="menuTree"
          show-checkbox
          node-key="id"
          :props="defaultProps"
          :default-checked-keys="selectedMenus"
          :check-strictly="false"
          @check="handleCheck"
          class="mb-4"
        />
      </div>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            Save
          </el-button>
        </div>
      </template>
    </el-dialog>
  </template>

  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import type { ElTree } from 'element-plus'
  import { ElNotification } from 'element-plus'
  import apiClient from '@/utils/apiClient'

  interface Props {
    modelValue: boolean
    roleId?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    roleId: undefined
  })

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }>()

  const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const treeRef = ref<InstanceType<typeof ElTree>>()
  const menuTree = ref([])
  const selectedMenus = ref<number[]>([])
  const submitting = ref(false)

  const defaultProps = {
    children: 'children',
    label: 'name'
  }

  const handleCheck = (node: any, {checkedKeys}: any) => {
    selectedMenus.value = checkedKeys
  }

  // Fetch menu tree
  const fetchMenuTree = async () => {
    try {
      const response = await apiClient.get('/role/api/roles/menu-tree/')
      if (response.data.code === 200) {
        menuTree.value = response.data.data
      }
    } catch (error) {
      ElNotification({
        title: 'Error',
        message: 'Failed to fetch menu tree',
        type: 'error'
      })
    }
  }

  // Fetch role's current menu permissions
  const fetchRoleMenus = async () => {
    if (!props.roleId) return

    try {
      const response = await apiClient.get(`/role/api/roles/${props.roleId}/menus/`)
      if (response.data.code === 200) {
        selectedMenus.value = response.data.data.menu_ids
      }
    } catch (error) {
      ElNotification({
        title: 'Error',
        message: 'Failed to fetch role permissions',
        type: 'error'
      })
    }
  }

  const handleSubmit = async () => {
    if (!props.roleId || !treeRef.value) return

    submitting.value = true

    try {
      const checkedKeys = treeRef.value.getCheckedKeys() as number[]
      // const halfCheckedKeys = treeRef.value.getHalfCheckedKeys() as number[]
      // const allSelectedKeys = [...checkedKeys, ...halfCheckedKeys]
      const allSelectedKeys = checkedKeys

      const response = await apiClient.put(`/role/api/roles/${props.roleId}/menus/`, {
        menu_ids: allSelectedKeys
      })

      if (response.data.code === 200) {
        ElNotification({
          title: 'Success',
          message: 'Role permissions updated successfully',
          type: 'success'
        })
        emit('success')
        dialogVisible.value = false
      }
    } catch (error) {
      ElNotification({
        title: 'Error',
        message: 'Failed to update role permissions',
        type: 'error'
      })
    } finally {
      submitting.value = false
    }
  }

  const handleClose = () => {
    selectedMenus.value = []
  }

  onMounted(() => {
    // Fetch data when dialog opens
    if (dialogVisible.value) {
      fetchMenuTree()
      fetchRoleMenus()
    }
  })

  // Watch for dialog visibility changes
  watch(() => dialogVisible.value, (newVal) => {
    if (newVal) {
      fetchMenuTree()
      fetchRoleMenus()
    }
  })
  </script>
