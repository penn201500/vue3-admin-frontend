import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UserLogin from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: UserLogin,
    },
    // Catch-all route
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

let initialAuthCheckDone = false

// Navigation Guard to Protect Routes
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Only do initial auth check once
  if (!initialAuthCheckDone) {
    await authStore.initializeStore()
    initialAuthCheckDone = true
  }

  if (to.meta.requiresAuth) {
    // If not authenticated, initialize the store
    if (!authStore.isAuthenticated) {
      await authStore.initializeStore()

      // If still not authenticated, refresh the token
      if (!authStore.isAuthenticated) {
        const refreshed = await authStore.refreshAccessToken()

        // If still not authenticated, redirect to login
        if (!refreshed) {
          next('/login')
          return
        }
      }
    }
  }
  next()
})

export default router
