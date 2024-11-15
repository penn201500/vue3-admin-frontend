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
</script>

<template>
  <!-- Theme Switcher Button -->
  <ThemeSwitcher v-if="isThemeSwitcherVisible" />

  <!-- Floating Header -->
  <FloatingHeader />

  <RouterView />

  <!-- Footer section -->
  <PageFooter />
</template>

<style lang="scss" scoped></style>
