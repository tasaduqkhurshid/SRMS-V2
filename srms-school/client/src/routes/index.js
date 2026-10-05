 import adminRoutes from './adminRoutes.js';

const { createWebHistory, createRouter } =VueRouter


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: adminRoutes
});


router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem("token");
  let role = "";
  try {
    role = String(JSON.parse(localStorage.getItem("user") || "{}").role || "").toUpperCase();
  } catch {
    role = "";
  }

  // If no token → send to login
  if ((!token || !["ADMIN", "SCHOOL_ADMIN"].includes(role)) && !to.path.endsWith("/login")) return next("/login");

  // If logged in and tries to go to login → redirect home
  if (token && ["ADMIN", "SCHOOL_ADMIN"].includes(role) && to.path.endsWith("/login")) return next("/dashboard");

  next();
});

export default router;
