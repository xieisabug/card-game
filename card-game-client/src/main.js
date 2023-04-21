import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import {host, port} from "./config";

import './assets/global_style.css';
// Vue.config.productionTip = false;
axios.defaults.baseURL = `${host}:${port}`;
axios.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    console.log(response.status);
    if (response.status === 401) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("userId");
        router.replace({
            path: "/login"
        })
    }
    return response;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.response.status === 401) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("userId");
        router.replace({
            path: "/login"
        })
    }
    return Promise.reject(error);
});

window.vm = createApp(App)

window.vm.use(router)
window.vm.use(store)

window.vm.mount('#app')