import {createRouter, createWebHashHistory} from 'vue-router'
import GameTable from './pages/GameTable'
import Login from './pages/Login'
import Register from './pages/Register'
import MainMenu from './pages/MainMenu'
import CreateCards from './pages/CreateCards'
import ChooseCards from './pages/ChooseCards'
import Suggest from './pages/Suggest'
import FirstTeach from './pages/FirstTeach'
import ChooseLevel from './pages/ChooseLevel'
import UserCenter from './pages/UserCenter'

const myRouter = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: Login
        },
        {
            path: '/register',
            name: 'Register',
            component: Register
        },
        {
            path: '/mainMenu',
            name: 'MainMenu',
            component: MainMenu
        },
        {
            path: '/chooseCards',
            name: 'ChooseCards',
            component: ChooseCards
        },
        {
            path: '/createCards',
            name: 'CreateCards',
            component: CreateCards
        },
        {
            path: '/pvp/:gameMode',
            name: 'GameTable',
            component: GameTable
        },
        {
            path: '/suggest',
            name: 'Suggest',
            component: Suggest
        },
        {
            path: '/pve',
            name: 'PveGameTable',
            component: GameTable
        },
        {
            path: '/firstTeach',
            name: 'FirstTeach',
            component: FirstTeach
        },
        {
            path: '/chooseLevel',
            name: 'ChooseLevel',
            component: ChooseLevel
        },
        {
            path: '/userCenter',
            name: 'UserCenter',
            component: UserCenter
        }
    ]
});

myRouter.beforeEach((to, from, next) => {
    if ( (to.path !== "/login" && to.path !== "/register") && !sessionStorage.getItem("token")) {
        next({ path: '/login' })
    } else {
        next()
    }
});

export default myRouter
