import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import {host, port} from "./config";

import './assets/global_style.css';
// Vue.config.productionTip = false;
axios.defaults.baseURL = `${host}:${port}`;

window.vm = createApp(App)

window.vm.use(router)
window.vm.use(store)

window.vm.mount('#app')