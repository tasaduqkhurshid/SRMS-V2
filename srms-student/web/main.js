import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import LoginView from './views/LoginView.vue';
import PortalView from './views/PortalView.vue';
import { portalApi } from './services/api.js';
import './style.css';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView, meta: { public: true } },
  ...['dashboard', 'profile', 'results', 'performance', 'fees', 'attendance', 'lectures', 'notes', 'notifications'].map((name) => ({
    path: `/${name}`,
    component: PortalView,
    props: { section: name },
  })),
  { path: '/:pathMatch(.*)*', redirect: '/login' },
];

const router = createRouter({ history: createWebHistory(), routes });
router.beforeEach((to) => {
  if (!to.meta.public && !portalApi.getToken()) return '/login';
  if (to.path === '/login' && portalApi.getToken()) return '/dashboard';
});

createApp(App).use(router).mount('#app');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/service-worker.js').catch(() => undefined));
}