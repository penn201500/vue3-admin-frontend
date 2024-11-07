import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UserLogin from '@/views/UserLogin.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
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

export default router
