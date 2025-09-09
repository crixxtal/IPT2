import { createApp } from 'vue'
import '@/assets/css/all.min.css'
import '@/style.css'
import { createPinia } from 'pinia'
import 'vue3-toastify/dist/index.css'
import { useAuthStore } from '@/stores/auth'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
const authStore = useAuthStore()

authStore.init().then(() => {
    app.use(router)
    app.mount('#app')
})