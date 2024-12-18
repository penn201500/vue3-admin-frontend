<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
    <div class="text-center space-y-6">
      <div class="space-y-2">
        <h1
          class="text-8xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"
        >
          404
        </h1>
        <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-200">Page Not Found</h2>
        <p class="text-gray-600 dark:text-gray-400 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <div class="flex justify-center gap-4">
        <el-button type="primary" class="!flex items-center gap-2" @click="router.push('/')">
          <el-icon><HomeFilled /></el-icon>
          Back to Home
        </el-button>
        <el-button class="!flex items-center gap-2" @click="router.go(-1)">
          <el-icon><ArrowLeft /></el-icon>
          Go Back
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HomeFilled, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
</script>
