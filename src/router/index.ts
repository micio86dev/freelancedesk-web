import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ClientsView from '@/views/ClientsView.vue'
import ProjectsView from '@/views/ProjectsView.vue'
import ProjectDetailView from '@/views/ProjectDetailView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { guest: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { guest: true } },
    { path: '/', name: 'dashboard', component: DashboardView, meta: { auth: true } },
    { path: '/clients', name: 'clients', component: ClientsView, meta: { auth: true } },
    { path: '/projects', name: 'projects', component: ProjectsView, meta: { auth: true } },
    { path: '/projects/:id', name: 'project-detail', component: ProjectDetailView, meta: { auth: true } },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.initialized) await auth.fetchUser()
  if (to.meta.auth && !auth.user) return { name: 'login' }
  if (to.meta.guest && auth.user) return { name: 'dashboard' }
})

export default router