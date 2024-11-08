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

// Navigation Guard to Protect Routes
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    await authStore.initializeStore()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Attempt to refresh token
    const refreshed = await authStore.refreshAccessToken()
    if (refreshed) {
      next()
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router
