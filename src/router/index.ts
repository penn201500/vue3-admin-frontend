import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UserLogin from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/authStore'
import { showNotification } from '@/utils/showNotification'
import NotFound from '@/components/NotFound.vue'
import SignUp from '@/views/SignUp.vue'

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
    {
      path: '/signup',
      name: 'Signup',
      component: SignUp,
      meta: { requiresAuth: false },
    },
    // Catch-all route
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
    },
  ],
})

let initialAuthCheckDone = false

// Navigation Guard to Protect Routes
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Don't require authentication for login and signup routes
  if (to.path === '/login' || to.path === '/signup') {
    console.log('Accessing auth route:', to.path)
    next()
    return
  }

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
