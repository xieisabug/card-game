import Vue from 'vue'
import Router from 'vue-router'
import GameTable from './pages/GameTable.vue'
import Login from './pages/Login.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'gameTable',
      component: GameTable
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
})
