import { createRouter, createWebHistory } from 'vue-router'
import { getStoredToken } from '../shared/auth/tokenStorage'
import HomeView from '../home/views/HomeView.vue'
import LoginView from '../auth/views/LoginView.vue'
import DailyGameView from '../game/views/DailyGameView.vue'
import PracticeGameView from '../game/views/PracticeGameView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/daily', name: 'daily', component: DailyGameView, meta: { requiresAuth: true } },
    { path: '/practice', name: 'practice', component: PracticeGameView, meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !getStoredToken()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && getStoredToken()) {
    return { name: 'home' }
  }

  return true
})

export default router
