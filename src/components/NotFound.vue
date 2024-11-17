<template>
    <div
      class="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
    >
      <div class="max-w-md text-center px-4">
        <h1 class="text-6xl font-bold mb-4">404</h1>
        <p class="text-xl mb-6">
          Oops! The page you're looking for doesn't exist.
        </p>
        <el-button type="primary" @click="goHome">Go to Home</el-button>
      </div>
    </div>
  </template>

  <script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { ElButton } from 'element-plus'

  const router = useRouter()

  const goHome = () => {
    router.push('/')
  }
  </script>
