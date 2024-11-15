import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UserLogin from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/authStore'
import { showNotification } from '@/utils/showNotification'

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
      name: 'Login',
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

      if (refreshed === true) {
        // Token refreshed successfully, proceed to the route
        await authStore.fetchUserInfo()
        next()
      } else if (refreshed === 'RATE_LIMIT') {
        // Rate limit hit: Inform the user but do not redirect to login
        showNotification(
          'Warning',
          'Session refresh rate limit reached. Please try again later.',
          'warning',
        )
        // Allow the user to remain on the current route
        next()
      } else {
        if (!authStore.rateLimit) {
          // If not rate limited, redirect to login
          // Token refresh failed, redirect to login
          next('/login')
        }
      }
    }
  } else {
    next()
  }
})

export default router
