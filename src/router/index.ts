import { createRouter, createWebHistory } from 'vue-router'
import { getStoredToken } from '../shared/auth/tokenStorage'
import HomeView from '../home/views/HomeView.vue'
import LoginView from '../auth/views/LoginView.vue'
import RegisterView from '../auth/views/RegisterView.vue'
import DailyGameView from '../game/views/DailyGameView.vue'
import PracticeGameView from '../game/views/PracticeGameView.vue'
import PracticePlayView from '../game/views/PracticePlayView.vue'
import UserProfileView from '../auth/views/UserProfileView.vue'
import AdminView from '../admin/views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/daily', name: 'daily', component: DailyGameView, meta: { requiresAuth: true } },
    { path: '/practice', name: 'practice', component: PracticeGameView, meta: { requiresAuth: true } },
    { path: '/practice/:gamesetId', name: 'practice-play', component: PracticePlayView, meta: { requiresAuth: true } },
    { path: '/profile', name: 'profile', component: UserProfileView, meta: { requiresAuth: true } },
    { path: '/admin', name: 'admin', component: AdminView, meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !getStoredToken()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if ((to.name === 'login' || to.name === 'register') && getStoredToken()) {
    return { name: 'home' }
  }

  return true
})

export default router
