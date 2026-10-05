import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import AdminDashboard from './AdminDashboard.vue';
import SuperAdminLogin from './components/pages/login/SuperAdminLogin.js';
import './style.css';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', name: 'login', component: SuperAdminLogin, meta: { public: true } },
    { path: '/dashboard', name: 'dashboard', component: AdminDashboard },
    { path: '/schools', name: 'schools', component: AdminDashboard },
    { path: '/schools/:id', name: 'school-detail', component: AdminDashboard },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
});

router.beforeEach((to) => {
  const token = localStorage.getItem('srms_platform_token') || sessionStorage.getItem('srms_platform_token');
  if (!to.meta.public && !token) return { name: 'login' };
  if (to.name === 'login' && token) return { name: 'dashboard' };
});

createApp(App).use(router).mount('#app');
