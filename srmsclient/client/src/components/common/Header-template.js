export default `
<header class="d-flex justify-content-between align-items-center p-3 bg-white border-bottom shadow-sm">
  <h5 class="mb-0 fw-bold">School Result Management System</h5>

  <!-- User dropdown -->
  <div class="dropdown">
    <button
      class="btn bg-transparent border-0 d-flex align-items-center dropdown-toggle"
      type="button"
      id="userDropdown"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <img src="/assets/images/avatar.png" alt="avatar" class="rounded-circle" height="36" />
      <span class="ms-2 text-muted fw-semibold">Admin</span>
    </button>

    <ul class="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="userDropdown">
      <li>
        <a class="dropdown-item d-flex align-items-center" href="/profile">
          <i class="fa-solid fa-user me-2 text-secondary"></i> Profile
        </a>
      </li>
      <li><hr class="dropdown-divider"></li>
      <li>
        <a class="dropdown-item d-flex align-items-center text-danger" href="#" id="logoutBtn">
          <i class="fa-solid fa-right-from-bracket me-2"></i> Logout
        </a>
      </li>
    </ul>
  </div>
</header>

`