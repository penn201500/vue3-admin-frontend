<template>
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
      <menu-item-recursive :menu-items="item.children" />
    </el-sub-menu>
  </template>
</template>

<script setup lang="ts">
import type { MenuItem } from '@/types/Tabs'

defineProps<{
  menuItems: MenuItem[]
}>()
</script>
