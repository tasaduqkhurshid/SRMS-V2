import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './style.css';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: App, meta: { public: true } },
    { path: '/:pathMatch(.*)*', component: App },
  ],
});

router.beforeEach((to) => {
  const token = localStorage.getItem('srms_platform_token');
  if (!to.meta.public && !token) return '/login';
  if (to.path === '/login' && token) return '/dashboard';
});

createApp(App).use(router).mount('#app');