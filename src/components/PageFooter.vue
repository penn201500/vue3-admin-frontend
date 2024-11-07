<script setup lang="ts" name="Header">
// Get the current year dynamically
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-300 py-6 text-center text-sm">
    <p>&copy; {{ currentYear }} Powered by Vue3. All rights reserved.</p>
  </footer>
</template>
