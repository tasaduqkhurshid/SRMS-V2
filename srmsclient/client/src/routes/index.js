 import adminRoutes from './adminRoutes.js';

const { createWebHistory, createRouter } =VueRouter


const routes = [
  ...adminRoutes,

];


const router = createRouter({
  history: createWebHistory('/'),
  routes
});


// ---------------- AUTH GUARD HERE ----------------
// ---------------- AUTH GUARD HERE ----------------
let userLoaded = localStorage;

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem("token");

  // If no token → send to login
  if (!token && !to.path.endsWith("/login")) return next("/login");

  // If logged in and tries to go to login → redirect home
  if (token && to.path.endsWith("/login")) return next("/");

  // Validate token once per refresh
  if (token && !userLoaded) {
    try {
      // adjust base path if your routes are mounted under /auth
      const { data } = await api.get("/auth/verify-jwt", { params: { token } });
      if (!data?.valid) throw new Error("Invalid token");

      // store only minimal safe fields
      localStorage.setItem("user", JSON.stringify(data.user));
      userLoaded = true;
    } catch {
      // token invalid/expired
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return next("/login");
    }
  }

  next();
});


// -------------------------------------------------

export default router;
