<template>
  <div class="bg-white dark:bg-gray-800">
    <div class="p-4">
      <!-- Search Bar & Filters -->
      <div class="flex flex-wrap gap-4 mb-4">
        <!-- Search Input -->
        <el-input
          v-model="searchQuery"
          placeholder="Search audit logs..."
          clearable
          class="w-80"
          @clear="refreshAuditLogs"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <!-- Module Filter -->
        <el-select v-model="filters.module" placeholder="Select Module" clearable class="w-40">
          <el-option
            v-for="module in moduleOptions"
            :key="module.value"
            :label="module.label"
            :value="module.value"
          />
        </el-select>

        <!-- Action Filter -->
        <el-select v-model="filters.action" placeholder="Select Action" clearable class="w-40">
          <el-option
            v-for="action in actionOptions"
            :key="action.value"
            :label="action.label"
            :value="action.value"
          />
        </el-select>

        <!-- Date Range Picker -->
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="to"
          start-placeholder="Start date"
          end-placeholder="End date"
          class="w-auto"
        />
      </div>

      <!-- Audit Log Table -->
      <el-table
        v-loading="loading"
        :data="auditLogs"
        :stripe="true"
        :border="true"
        class="w-full"
        :header-cell-class-name="'!text-gray-700 dark:!text-gray-200 !font-semibold'"
        :empty-text="'No Data'"
      >
        <el-table-column prop="username" label="User" width="120">
          <template #default="{ row }">
            {{ row.username || 'System' }}
          </template>
        </el-table-column>

        <el-table-column prop="action" label="Action" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getActionTagType(row.action)" size="small">
              {{ row.action }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="module" label="Module" width="150">
          <template #default="{ row }">
            {{ getModuleLabel(row.module) }}
          </template>
        </el-table-column>

        <el-table-column prop="resource_type" label="Resource Type" width="150" />

        <el-table-column prop="timestamp" label="Time" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.timestamp) }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="Status" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'" size="small">
              {{ row.status ? 'Success' : 'Failed' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="message" label="Message" min-width="200" show-overflow-tooltip />

        <el-table-column fixed="right" label="Actions" width="80" align="center">
          <template #default="{ row }">
            <el-tooltip content="View Details" placement="top">
              <el-button type="primary" size="small" @click="showDetails(row)">
                <el-icon><Document /></el-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- Details Dialog -->
      <el-dialog
        v-model="detailsVisible"
        title="Audit Log Details"
        width="60%"
        destroy-on-close
        class="audit-details-dialog"
      >
        <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div v-if="selectedDetails" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-gray-500 dark:text-gray-400">IP Address</div>
                <div class="font-medium">{{ selectedDetails.ip_address || 'N/A' }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500 dark:text-gray-400">User Email</div>
                <div class="font-medium">{{ selectedDetails.user_email || 'N/A' }}</div>
              </div>
            </div>

            <div>
              <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">Request Details</div>
              <pre
                class="whitespace-pre-wrap text-sm bg-white dark:bg-gray-800 p-4 rounded border dark:border-gray-700"
                >{{ JSON.stringify(selectedDetails.detail, null, 2) }}</pre
              >
            </div>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Search, Document } from '@element-plus/icons-vue'
import apiClient from '@/utils/apiClient'
import type { AuditLog } from '@/types/AuditLog'

// Define types
interface Filters {
  module: string
  action: string
}

interface ModuleOption {
  label: string
  value: string
}

interface ActionOption {
  label: string
  value: string
}

// Define component data
const moduleOptions: ModuleOption[] = [
  { label: 'User Management', value: 'USER' },
  { label: 'Role Management', value: 'ROLE' },
  { label: 'Menu Management', value: 'MENU' },
]

const actionOptions: ActionOption[] = [
  { label: 'Create', value: 'CREATE' },
  { label: 'Update', value: 'UPDATE' },
  { label: 'Delete', value: 'DELETE' },
]

const loading = ref(false)
const auditLogs = ref<AuditLog[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const dateRange = ref<[Date, Date] | null>(null)
const filters = ref<Filters>({
  module: '',
  action: '',
})

// Details dialog
const detailsVisible = ref(false)
const selectedDetails = ref<AuditLog | null>(null)

const formatDateTime = (date: string | null): string => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString()
}

const getModuleLabel = (moduleValue: string): string => {
  const module = moduleOptions.find((m) => m.value === moduleValue)
  return module?.label || moduleValue
}

const fetchAuditLogs = async () => {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value,
      module: filters.value.module,
      action: filters.value.action,
    }

    if (dateRange.value?.[0] && dateRange.value[1]) {
      params.start_date = dateRange.value[0].toISOString()
      params.end_date = dateRange.value[1].toISOString()
    }

    const response = await apiClient.get('/api/audit/logs/', { params })
    if (response.data.results) {
      auditLogs.value = response.data.results
      total.value = response.data.count || 0
    }
  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
  } finally {
    loading.value = false
  }
}

const refreshAuditLogs = () => {
  currentPage.value = 1
  fetchAuditLogs()
}

const handleSearch = () => {
  refreshAuditLogs()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  refreshAuditLogs()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchAuditLogs()
}

const showDetails = (row: AuditLog) => {
  selectedDetails.value = row
  detailsVisible.value = true
}

const getActionTagType = (action: string): string => {
  const types: Record<string, string> = {
    CREATE: 'success',
    UPDATE: 'warning',
    DELETE: 'danger',
  }
  return types[action] || 'info'
}

// Watch filters and date range
watch([filters, dateRange], () => refreshAuditLogs(), { deep: true })

onMounted(() => {
  fetchAuditLogs()
})
</script>
