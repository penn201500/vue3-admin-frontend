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
    if (authStore.isAuthenticated) {
      // User is already authenticated, proceed to the route
      next()
    } else {
      // If not authenticated, refresh the token
      const refreshed = await authStore.refreshAccessToken()

      if (refreshed) {
        // Token refreshed successfully, proceed to the route
        await authStore.fetchUserInfo()
        next()
      } else {
        // Token refresh failed, redirect to login
        next('/login')
      }
    }
  } else {
    next()
  }
})

export default router
