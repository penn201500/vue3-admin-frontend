import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import ElementPlus from 'element-plus'
import './assets/tailwind.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { i18n } from './i18n'

const app = createApp(App)
const pinia = createPinia()

app.use(i18n)
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// Initialize theme after Pinia is ready
import { useThemeStore } from '@/stores/theme'
const themeStore = useThemeStore()
themeStore.initializeTheme()

// Initialize auth store and fetch CSRF token
import apiClient from '@/utils/apiClient'

// Fetch CSRF token before initializing the auth store
apiClient.get('/user/api/csrf/').then(() => {
})

app.mount('#app')
