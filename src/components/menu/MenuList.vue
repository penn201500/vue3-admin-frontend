<template>
  <el-menu :default-active="activeMenu" class="menu-container" @select="handleMenuSelect">
    <template v-for="item in menuItems" :key="item.id">
      <el-menu-item v-if="!item.children?.length" :index="item.path">
        <el-icon v-if="item.icon">
          <component :is="item.icon" />
        </el-icon>
        <span>{{ item.name }}</span>
      </el-menu-item>

      <el-sub-menu v-else :index="item.path">
        <template #title>
          <el-icon v-if="item.icon">
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.name }}</span>
        </template>
        <!-- Recursive menu items -->
        <menu-item-recursive :menu-items="item.children" />
      </el-sub-menu>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTabStore } from '@/stores/tabStore'
import type { MenuItem } from '@/types/Tabs'

const router = useRouter()
const route = useRoute()
const tabStore = useTabStore()

const activeMenu = ref(route.path)
const menuItems = ref<MenuItem[]>([])

onMounted(async () => {
  // Fetch menu items from your API
  // menuItems.value = await fetchMenuItems()
  menuItems.value = [
    {
      id: 1,
      name: 'Settings',
      icon: 'Setting',
      parent_id: 0,
      order_num: 1,
      path: '/settings/menu',
      component: 'settings/menu/index',
      menu_type: 'menu',
      children: [],
    },
    {
      id: 2,
      name: 'Department',
      icon: 'Office',
      parent_id: 0,
      order_num: 2,
      path: '/bizm/department',
      component: 'bizm/Department',
      menu_type: 'menu',
      children: [],
    },
  ]
})

const handleMenuSelect = (path: string) => {
  console.log('Menu selected:', path)
  const menuItem = findMenuItem(menuItems.value, path)
  console.log('Found menu item:', menuItem)

  if (menuItem && menuItem.component) {
    console.log('Adding tab for:', menuItem)
    tabStore.addTab(menuItem)
    router.push(path)
  }
}

const findMenuItem = (items: MenuItem[], path: string): MenuItem | undefined => {
  for (const item of items) {
    if (item.path === path) return item
    if (item.children?.length) {
      const found = findMenuItem(item.children, path)
      if (found) return found
    }
  }
  return undefined
}
</script>
