export default `
<header class="topbar bg-white border-bottom border-light shadow-sm py-3 px-4 d-flex align-items-center justify-content-between">
  <div>
    <p class="eyebrow text-primary small mb-0 fw-semibold" style="letter-spacing: 0.1em; font-size: 0.7rem;">{{ eyebrow }}</p>
    <h1 class="mb-0 fw-bold" style="font-size: 1.5rem; color: #122449;">{{ title }}</h1>
  </div>
  <div class="topbar-actions d-flex align-items-center gap-3">
    <AdminNotificationBell :token="token" />
    <span class="admin-pill bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-semibold" style="font-size: 0.8rem;">Super Admin</span>
  </div>
</header>
`;
