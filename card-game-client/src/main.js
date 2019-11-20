import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import {host, port} from "./config";

require('./assets/global_style.css');
Vue.config.productionTip = false;
axios.defaults.baseURL = `${host}:${port}`;

window.vm = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
