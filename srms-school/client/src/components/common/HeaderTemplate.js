export default `
<header class="app-header-bar">
  <div class="header-primary">
    <button class="header-hamburger" type="button" @click="$emit('toggle-sidebar')" aria-label="Toggle navigation">
      <i class="fa-solid fa-bars"></i>
    </button>

    <div class="header-school-brand">
      <div class="header-school-mark">
        <img v-if="logoUrl" :src="logoUrl" alt="School logo" @error="logoUrl = ''" />
        <i v-else class="fa-solid fa-school" aria-hidden="true"></i>
      </div>
      <div class="header-school-info" v-if="schoolName">
        <h1 class="header-school-name">{{ schoolName }}</h1>
        <span class="header-school-subtitle">School Administration Portal</span>
      </div>
    </div>
  </div>

  <div class="header-search-wrapper">
    <div class="header-search">
      <i class="fa-solid fa-magnifying-glass search-icon" aria-hidden="true"></i>
      <input
        ref="searchInput"
        type="search"
        class="form-control"
        placeholder="Search students, subjects, exams..."
        @keyup.enter="handleSearch"
        v-model="searchQuery"
        aria-label="Search students, subjects, exams"
      />
      <kbd class="header-search-shortcut">Ctrl + K</kbd>
    </div>
  </div>

  <div class="header-right">
    <button class="btn header-icon-btn header-notifications" type="button" @click="handleNotifications" aria-label="Notifications">
      <i class="fa-solid fa-bell"></i>
      <span v-if="notificationCount > 0" class="header-notification-badge">{{ notificationCount }}</span>
    </button>
    <div class="header-apps" aria-hidden="true"><i class="fa-solid fa-grip"></i></div>
    <span class="header-right-divider" aria-hidden="true"></span>

    <div class="dropdown">
      <button
        class="btn header-user"
        type="button"
        id="userDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        :aria-label="'Account menu for ' + userName"
      >
        <span class="header-avatar-wrapper">
          <span class="header-avatar" v-if="!userImage"><span>{{ userInitials }}</span></span>
          <img v-else :src="userImage" :alt="userName" class="header-avatar-img" />
          <span class="header-online-indicator" aria-label="Online"></span>
        </span>
        <span class="header-user-info">
          <span class="header-user-name">{{ userName }}</span>
          <span class="header-user-role-badge">{{ userRole }}</span>
        </span>
        <i class="fa-solid fa-chevron-down header-dropdown-arrow" aria-hidden="true"></i>
      </button>

      <ul class="dropdown-menu dropdown-menu-end header-dropdown-menu shadow-sm" aria-labelledby="userDropdown">
        <li>
          <div class="dropdown-header header-dropdown-header">
            <div class="d-flex align-items-center gap-3">
              <div class="header-avatar-wrapper">
                <div class="header-avatar header-avatar-lg" v-if="!userImage"><span>{{ userInitials }}</span></div>
                <img v-else :src="userImage" :alt="userName" class="header-avatar-img-lg" />
                <span class="header-online-indicator" aria-label="Online"></span>
              </div>
              <div>
                <div class="fw-semibold">{{ userName }}</div>
                <small class="text-muted">{{ user.email }}</small>
              </div>
            </div>
          </div>
        </li>
        <li><hr class="dropdown-divider" /></li>
        <li><a class="dropdown-item d-flex align-items-center gap-2" href="#/profile"><i class="fa-solid fa-user text-muted"></i><span>Profile</span></a></li>
        <li><a class="dropdown-item d-flex align-items-center gap-2" href="#/settings"><i class="fa-solid fa-gear text-muted"></i><span>Settings</span></a></li>
        <li><hr class="dropdown-divider" /></li>
        <li><button class="dropdown-item d-flex align-items-center gap-2 text-danger" @click="handleLogout"><i class="fa-solid fa-right-from-bracket"></i><span>Logout</span></button></li>
      </ul>
    </div>
  </div>
</header>
`;
