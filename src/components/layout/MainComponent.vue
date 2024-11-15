<template>
  <div class="tabs-container mb-0 p-0">
    <el-button size="small" @click="addTab" type="primary" class="text-red-500">
      <el-icon class="mr-1"><Plus /></el-icon>
      Add Tab
    </el-button>

    <el-tabs v-model="editableTabsValue" type="card" closable @tab-remove="removeTab" class="bg-white dark:bg-gray-500 p-4 shadow">
      <el-tab-pane
        v-for="item in editableTabs"
        :key="item.name"
        :label="item.title"
        :name="item.name"
      >
        {{ item.content }}
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'

interface TabItem {
  title: string
  name: string
  content: string
}

let tabIndex = 2
const editableTabsValue = ref('2')
const editableTabs = ref<TabItem[]>([
  {
    title: 'Dashboard',
    name: '1',
    content: 'Dashboard content',
  },
  {
    title: 'Settings',
    name: '2',
    content: 'Settings content',
  },
])

const addTab = () => {
  const newTabName = `${++tabIndex}`
  editableTabs.value.push({
    title: `New Tab ${newTabName}`,
    name: newTabName,
    content: `Content for Tab ${newTabName}`,
  })
  editableTabsValue.value = newTabName
}

const removeTab = (targetName: string) => {
  const tabs = editableTabs.value
  let activeName = editableTabsValue.value
  if (activeName === targetName) {
    tabs.forEach((tab, index) => {
      if (tab.name === targetName) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activeName = nextTab.name
        }
      }
    })
  }
  editableTabsValue.value = activeName
  editableTabs.value = tabs.filter((tab) => tab.name !== targetName)
}
</script>
