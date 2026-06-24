 import adminRoutes from './adminRoutes.js';

const { createWebHistory, createRouter } =VueRouter


const router = createRouter({
  history: createWebHistory('/'),
  routes: adminRoutes
});


router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem("token");

  // If no token → send to login
  if (!token && !to.path.endsWith("/login")) return next("/login");

  // If logged in and tries to go to login → redirect home
  if (token && to.path.endsWith("/login")) return next("/");

  next();
});

export default router;
