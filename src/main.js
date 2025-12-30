import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/theme.css'

// Load eruda in development to inspect the app on mobile devices.
if (import.meta.env.DEV) {
  import('eruda').then(({ default: eruda }) => eruda.init())
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
