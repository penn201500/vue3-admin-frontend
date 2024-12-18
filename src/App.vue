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

// Check if current route is an auth page (login or signup)
const isAuthPage = computed(() => ['Login', 'Signup'].includes(route.name as string))
</script>

<template>
  <!-- Render layout components for auth pages -->
  <div v-if="isAuthPage">
    <!-- Theme Switcher Button -->
    <ThemeSwitcher v-if="isThemeSwitcherVisible" />

    <!-- Floating Header -->
    <FloatingHeader />

    <!-- Footer section -->
    <PageFooter />
  </div>

  <RouterView />
</template>
