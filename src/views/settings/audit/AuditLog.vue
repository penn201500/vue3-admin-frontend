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

        <!-- Date Range Picker - Desktop -->
        <div class="hidden md:block">
          <div class="flex items-center gap-2">
            <!-- Start Date & Time -->
            <div class="flex gap-2">
              <el-date-picker
                v-model="dateRange"
                type="date"
                placeholder="Start date"
                :size="'default'"
                :shortcuts="dateShortcuts"
                class="!w-[180px]"
                value-format="YYYY-MM-DD"
              />
              <el-time-picker
                v-model="startTime"
                placeholder="Start time"
                :size="'default'"
                class="!w-[130px]"
                value-format="HH:mm:ss"
              />
            </div>

            <span class="text-gray-400">to</span>

            <!-- End Date & Time -->
            <div class="flex gap-2">
              <el-date-picker
                v-model="endDate"
                type="date"
                placeholder="End date"
                :size="'default'"
                class="!w-[180px]"
                value-format="YYYY-MM-DD"
              />
              <el-time-picker
                v-model="endTime"
                placeholder="End time"
                :size="'default'"
                class="!w-[130px]"
                value-format="HH:mm:ss"
              />
            </div>
          </div>
        </div>

        <!-- Date Range Picker - Mobile -->
        <div class="block md:hidden w-full">
          <div class="flex flex-col gap-2">
            <!-- Start Date & Time -->
            <div class="flex gap-2">
              <el-date-picker
                v-model="startDate"
                type="date"
                placeholder="Start date"
                :size="'default'"
                class="flex-1"
                value-format="YYYY-MM-DD"
              />
              <el-time-picker
                v-model="startTime"
                placeholder="Start time"
                :size="'default'"
                class="!w-[130px]"
                value-format="HH:mm:ss"
              />
            </div>

            <!-- End Date & Time -->
            <div class="flex gap-2">
              <el-date-picker
                v-model="endDate"
                type="date"
                placeholder="End date"
                :size="'default'"
                class="flex-1"
                value-format="YYYY-MM-DD"
              />
              <el-time-picker
                v-model="endTime"
                placeholder="End time"
                :size="'default'"
                class="!w-[130px]"
                value-format="HH:mm:ss"
              />
            </div>
          </div>
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
      </div>
      <!-- Pagination -->
      <!-- Desktop Pagination -->
      <div class="hidden md:flex justify-end mt-1">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50, 100]"
          :total="total"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- Mobile Pagination -->
      <div class="md:hidden flex justify-center mt-4">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          :background="true"
          layout="prev, pager, next"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- Details Dialog -->
      <el-dialog
        v-model="detailsVisible"
        title="Audit Log Details"
        class="w-[90%] sm:w-[500px] mx-auto audit-details-dialog"
        destroy-on-close
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
import { format } from 'date-fns'

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
// For date picker
const startDate = ref<string | null>(null)
const startTime = ref<string | null>(null)
const endDate = ref<string | null>(null)
const endTime = ref<string | null>(null)

// Watch for changes and combine into dateRange
watch(
  [startDate, startTime, endDate, endTime],
  () => {
    if (startDate.value && startTime.value && endDate.value && endTime.value) {
      const start = `${startDate.value} ${startTime.value}`
      const end = `${endDate.value} ${endTime.value}`
      dateRange.value = [new Date(start), new Date(end)]
    } else {
      dateRange.value = null
    }

    refreshAuditLogs()
  },
  { deep: true },
)

const dateRange = ref<[Date, Date] | null>(null)

// Update when dateRange changes from shortcuts
watch(
  dateRange,
  (newRange) => {
    if (newRange) {
      const [start, end] = newRange
      startDate.value = formatDate(start, 'YYYY-MM-DD')
      startTime.value = formatDate(start, 'HH:mm:ss')
      endDate.value = formatDate(end, 'YYYY-MM-DD')
      endTime.value = formatDate(end, 'HH:mm:ss')
    } else {
      startDate.value = null
      startTime.value = null
      endDate.value = null
      endTime.value = null
    }
  },
  { deep: true },
)

// Helper function to format dates
function formatDate(date: Date, formatStr: string) {
  return format(date, formatStr)
}

// Date shortcuts
const dateShortcuts = [
  {
    text: 'Last hour',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setHours(end.getHours() - 1)
      return [start, end]
    },
  },
  {
    text: 'Today',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      return [start, end]
    },
  },
  {
    text: 'Last 24 hours',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(end.getTime() - 3600 * 1000 * 24)
      return [start, end]
    },
  },
  {
    text: 'Last 7 days',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(end.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
]

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
