<template>
  <el-table
    ref="tableRef"
    v-loading="loading"
    :data="menus"
    row-key="id"
    :stripe="true"
    :border="true"
    :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    :header-cell-class-name="'!text-gray-700 dark:!text-gray-200 !font-semibold'"
    :row-class-name="tableRowClassName"
    class="w-full mb-4"
  >
    <el-table-column prop="name" label="Menu Name" min-width="240" />

    <el-table-column prop="icon" label="Icon" width="60" align="center">
      <template #default="{ row }">
        <el-icon v-if="row.icon" class="text-lg">
          <component :is="getIcon(row.icon)" />
        </el-icon>
      </template>
    </el-table-column>

    <el-table-column prop="path" label="Router Path" min-width="180" show-overflow-tooltip />

    <el-table-column prop="component" label="Component Path" min-width="180" show-overflow-tooltip>
      <template #default="{ row }">
        <span class="text-gray-600">{{ row.component || '-' }}</span>
      </template>
    </el-table-column>

    <el-table-column prop="order_num" label="Order" width="80" align="center" />

    <el-table-column prop="status" label="Status" width="100" align="center">
      <template #default="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
          {{ row.status === 1 ? 'Enabled' : 'Disabled' }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column prop="remark" label="Comment" min-width="200" show-overflow-tooltip>
      <template #default="{ row }">
        <span class="text-gray-600">{{ row.remark || '-' }}</span>
      </template>
    </el-table-column>

    <el-table-column label="Actions" width="100" fixed="right">
      <template #default="{ row }">
        <el-button-group>
          <el-button type="primary" :icon="Edit" size="small" @click="handleEdit(row)" />
          <el-button type="danger" :icon="Delete" size="small" @click="handleDelete(row)" />
        </el-button-group>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import { getIcon } from '@/utils/iconUtils'
import Sortable from 'sortablejs'
import type { SortableEvent } from 'sortablejs'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { MenuItem } from '@/types/Menu'

const props = defineProps<{
  menus: MenuItem[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', menu: MenuItem): void
  (e: 'delete', menu: MenuItem): void
  (
    e: 'drop',
    data: { dragNode: MenuItem; dropNode: MenuItem; type: 'inner' | 'before' | 'after' },
  ): void
}>()

const tableRef = ref()

const tableRowClassName = ({ rowIndex }: { rowIndex: number }) => {
  const baseClasses = 'transition-colors duration-150 !py-1'
  const hoverClasses = 'hover:bg-gray-100 dark:hover:bg-gray-700/90'
  return rowIndex % 2 === 0
    ? `${baseClasses} ${hoverClasses} bg-white dark:bg-gray-900`
    : `${baseClasses} ${hoverClasses} bg-green-50/30 dark:bg-gray-800/50`
}

const handleEdit = (row: MenuItem) => {
  emit('edit', row)
}

const handleDelete = async (row: MenuItem) => {
  if (row.children?.length) {
    ElMessage.warning('Cannot delete menu with children')
    return
  }
  try {
    await ElMessageBox.confirm('This action will delete the menu. Continue?', 'Warning', {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
    })
    emit('delete', row)
  } catch {
    // User cancelled
  }
}

const initSortable = () => {
  const el = tableRef.value?.$el.querySelector('.el-table__body-wrapper tbody')
  if (!el) return

  new Sortable(el, {
    group: 'nested',
    animation: 150,
    fallbackOnBody: true,
    dragClass: 'sortable-drag',
    ghostClass: 'sortable-ghost',
    onEnd: (evt: SortableEvent) => {
      const { newIndex, oldIndex } = evt
      if (typeof newIndex === 'number' && typeof oldIndex === 'number') {
        const dragNode = props.menus[oldIndex]
        const dropNode = props.menus[newIndex]
        if (dragNode && dropNode) {
          let type: 'inner' | 'before' | 'after' = 'after'
          if (dropNode.children?.length || newIndex < oldIndex) {
            type = 'inner'
          }
          emit('drop', { dragNode, dropNode, type })
        }
      }
    },
  })
}

onMounted(() => {
  if (tableRef.value) {
    initSortable()
  }
})
</script>
