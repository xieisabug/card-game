import Vue from 'vue'
import Router from 'vue-router'
import GameTable from './pages/GameTable.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'gameTable',
      component: GameTable
    }
  ]
})
