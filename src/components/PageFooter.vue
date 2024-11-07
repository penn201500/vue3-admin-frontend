<script setup lang="ts" name="Header">
// Get the current year dynamically
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-blue-800 text-gray-200 py-6 text-center">
    <p>&copy; {{ currentYear }} Powered by Vue3. All rights reserved.</p>
  </footer>
</template>
