import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './style.css'
import './assets/styles/buttons.css'

/* -----------------------------
   FONT AWESOME
----------------------------- */

import { library } from '@fortawesome/fontawesome-svg-core'

import {
  faHouse,
  faBrain,
  faTrophy,
  faBolt,
  faHeadset,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(
  faHouse,
  faBrain,
  faTrophy,
  faBolt,
  faHeadset,
  faArrowLeft,
)

/* -----------------------------
   CREATE APP
----------------------------- */

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.component(
  'font-awesome-icon',
  FontAwesomeIcon,
)

app.mount('#app')