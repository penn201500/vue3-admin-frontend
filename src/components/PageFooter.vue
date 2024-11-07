<script setup lang="ts">
// Get the current year dynamically
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-300 py-6 text-center shadow fixed bottom-0 left-0 right-0 z-10 text-sm">
    <p>&copy; {{ currentYear }} Powered by Vue3. All rights reserved.</p>
  </footer>
</template>
