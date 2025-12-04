import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/main.css' // <--- PERHATIKAN BARIS INI. Jangan './style.css'
import App from './App.vue'
import router from './router'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')