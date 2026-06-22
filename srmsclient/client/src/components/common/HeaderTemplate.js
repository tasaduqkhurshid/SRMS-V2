export default `
<header class="d-flex justify-content-between align-items-center p-3 bg-white border-bottom shadow-sm">
  <!-- Left: School info -->
  <div class="d-flex align-items-center">
    <img :src="logoUrl" alt="School Logo" height="40" class="me-2" />
    <h5 class="mb-0 fw-bold">{{ user.schoolName || 'School Result Management System' }}</h5>
  </div>

  <!-- Right: User dropdown -->
  <div class="dropdown">
    <button
      class="btn bg-transparent border-0 d-flex align-items-center dropdown-toggle"
      type="button"
      id="userDropdown"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <img
        :src="user.image || '/assets/images/avatar.png'"
        alt="User Avatar"
        class="rounded-circle me-2"
        height="36"
        width="36"
      />
      <span class="fw-semibold text-muted">{{ user.email|| user.username || 'Guest' }}</span>
    </button>

    <ul class="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="userDropdown">
      <li>
        <a class="dropdown-item d-flex align-items-center" href="#/profile">
          <i class="fa-solid fa-user me-2 text-secondary"></i>
          Profile
        </a>
      </li>
      <li><hr class="dropdown-divider" /></li>
      <li>
        <button class="dropdown-item d-flex align-items-center text-danger" @click="handleLogout">
          <i class="fa-solid fa-right-from-bracket me-2"></i>
          Logout
        </button>
      </li>
    </ul>
  </div>
</header>


`
