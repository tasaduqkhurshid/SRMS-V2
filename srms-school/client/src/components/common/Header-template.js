export default `
<header class="app-header-bar">
  <!-- Left: school context + search -->
  <div class="header-left d-flex align-items-center gap-3">
    <span class="header-school">{{ schoolName }}</span>

    <div class="header-search d-none d-md-block">
      <i class="fa-solid fa-search search-icon"></i>
      <input
        type="text"
        placeholder="Search..."
        v-model="searchQuery"
        @keyup.enter="handleSearch"
        aria-label="Search"
      />
    </div>
  </div>

  <!-- Right: actions + user -->
  <div class="header-right">
    <button
      type="button"
      class="header-icon-btn"
      title="Notifications"
      aria-label="Notifications"
      @click="handleNotifications"
    >
      <i class="fa-solid fa-bell"></i>
    </button>

    <!-- User dropdown -->
    <div class="dropdown">
      <button
        class="header-user dropdown-toggle"
        type="button"
        id="userDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <img src="/assets/images/avatar.png" alt="avatar" class="rounded-circle" />
        <span class="header-username">{{ user.username || user.name || 'hanfia-admin' }}</span>
      </button>

      <ul class="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="userDropdown">
        <li>
          <a class="dropdown-item d-flex align-items-center" href="/profile">
            <i class="fa-solid fa-user me-2 text-secondary"></i> Profile
          </a>
        </li>
        <li><hr class="dropdown-divider"></li>
        <li>
          <a class="dropdown-item d-flex align-items-center text-danger" href="#" @click.prevent="handleLogout">
            <i class="fa-solid fa-right-from-bracket me-2"></i> Logout
          </a>
        </li>
      </ul>
    </div>
  </div>
</header>
`
