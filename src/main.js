import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/theme.css'

// Always load eruda to inspect the app (useful on mobile and production).
import('eruda').then(({ default: eruda }) => eruda.init())

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
