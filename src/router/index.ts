import { createRouter, createWebHistory } from 'vue-router'
import { getStoredToken } from '../shared/auth/tokenStorage'
import HomeView from '../home/views/HomeView.vue'
import LoginView from '../auth/views/LoginView.vue'
import RegisterView from '../auth/views/RegisterView.vue'
import DailyGameView from '../game/views/DailyGameView.vue'
import GameSelectView from '../game/views/GameSelectView.vue'
import GamePlayView from '../game/views/GamePlayView.vue'
import UserProfileView from '../auth/views/UserProfileView.vue'
import AvatarEditorView from '../auth/views/AvatarEditorView.vue'
import AdminView from '../admin/views/AdminView.vue'
import UserEditView from '../admin/views/UserEditView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/daily', name: 'daily', component: DailyGameView, meta: { requiresAuth: true } },
    { path: '/game', name: 'game-select', component: GameSelectView, meta: { requiresAuth: true } },
    { path: '/game/:gamesetId', name: 'game-play', component: GamePlayView, meta: { requiresAuth: true } },
    { path: '/profile', name: 'profile', component: UserProfileView, meta: { requiresAuth: true } },
    { path: '/profile/avatar', name: 'avatar-editor', component: AvatarEditorView, meta: { requiresAuth: true } },
    { path: '/admin', name: 'admin', component: AdminView, meta: { requiresAuth: true } },
    { path: '/admin/users/:userId', name: 'admin-user-edit', component: UserEditView, meta: { requiresAuth: true } },
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
