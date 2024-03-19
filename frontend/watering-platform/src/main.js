import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.css'
import boostrap from 'bootstrap/dist/js/bootstrap.js'
import router from './services/router.js'

createApp(App).use(boostrap).use(router).mount('#app')