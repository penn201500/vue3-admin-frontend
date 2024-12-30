<template>
  <div class="icon-picker">
    <el-popover v-model:visible="visible" trigger="click" :width="360" placement="bottom">
      <template #reference>
        <div
          class="flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors min-h-[40px]"
          :class="[
            modelValue
              ? 'border-blue-500 hover:border-blue-600'
              : 'border-gray-300 hover:border-blue-500',
          ]"
        >
          <el-icon v-if="modelValue && selectedIcon" class="text-lg">
            <component :is="selectedIcon" />
          </el-icon>
          <span v-if="modelValue" class="text-sm text-gray-600 dark:text-gray-300">{{
            modelValue
          }}</span>
          <span v-else class="text-sm text-gray-400 dark:text-gray-500">Select an icon</span>
        </div>
      </template>

      <div class="flex flex-col gap-4">
        <el-input v-model="searchQuery" placeholder="Search icons..." clearable>
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <div class="h-[300px] overflow-y-auto pr-2 overflow-x-hidden">
          <div class="grid grid-cols-6 gap-2">
            <div
              v-for="icon in filteredIcons"
              :key="icon.name"
              class="flex flex-col items-center p-2 rounded cursor-pointer transition-colors aspect-square group"
              :class="[
                modelValue === icon.name
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700',
              ]"
              @click="selectIcon(icon.name)"
            >
              <el-icon size="20">
                <component :is="icon.component" />
              </el-icon>
              <span class="text-xs mt-1 truncate w-full text-center">
                {{ icon.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getIcon, getAllIcons } from '@/utils/iconUtils'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const visible = ref(false)
const searchQuery = ref('')

const selectedIcon = computed(() => {
  if (!props.modelValue) return null
  return getIcon(props.modelValue)
})

const allIcons = getAllIcons()

const filteredIcons = computed(() => {
  let icons = allIcons
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    icons = icons.filter(icon => icon.name.toLowerCase().includes(query))
  }
  return icons
})

const selectIcon = (name: string) => {
  emit('update:modelValue', name)
  visible.value = false
}
</script>
