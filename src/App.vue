<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import PageFooter from './components/PageFooter.vue'
import { useUIStore } from './stores/ui'
import { computed } from 'vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import FloatingHeader from './components/FloatingHeader.vue'

const uiStore = useUIStore()

// Computed properties for visibility
const isThemeSwitcherVisible = computed(() => uiStore.isThemeSwitcherVisible)

// Import useRoute to access the current route
const route = useRoute()

// Computed property to check if the current route is the login page
const isLoginPage = computed(() => route.name === 'Login')
</script>

<template>
  <!-- Render only when on the login page -->
  <div v-if="isLoginPage">
    <!-- Theme Switcher Button -->
    <ThemeSwitcher v-if="isThemeSwitcherVisible" />

    <!-- Floating Header -->
    <FloatingHeader />
  </div>

  <RouterView />

  <!-- Footer section -->
  <PageFooter />
</template>

<style lang="scss" scoped></style>
