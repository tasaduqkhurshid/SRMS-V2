export default `
<header class="app-header-bar">
  <!-- Left: Hamburger + School Info -->
  <div class="header-left d-flex align-items-center gap-3">
    <!-- Hamburger toggle for mobile -->
    <button class="btn btn-icon header-hamburger d-lg-none" @click="$emit('toggle-sidebar')" aria-label="Toggle menu">
      <i class="fa-solid fa-bars"></i>
    </button>

    <!-- School Icon & Name -->
    <div class="d-flex align-items-center gap-3">
      <div class="header-school-icon">
        <i class="fa-solid fa-school"></i>
      </div>
      <div class="header-school-info" v-if="schoolName">
        <h4 class="mb-0 header-school-name">{{ schoolName }}</h4>
      </div>
    </div>
  </div>

  <!-- Center: Search -->
  <div class="header-center d-none d-md-flex flex-1 justify-content-center">
    <div class="header-search">
      <i class="fa-solid fa-magnifying-glass search-icon"></i>
      <input 
        type="text" 
        class="form-control" 
        placeholder="Search students, exams, subjects..." 
        @keyup.enter="handleSearch"
        v-model="searchQuery"
      />
    </div>
  </div>

  <!-- Right: Notification + User Avatar + Dropdown -->
  <div class="header-right d-flex align-items-center gap-3">
    <!-- Notification Bell -->
    <div class="position-relative">
      <button class="btn btn-icon header-icon-btn position-relative" @click="handleNotifications" aria-label="Notifications">
        <i class="fa-solid fa-bell"></i>
        <span v-if="notificationCount > 0" class="header-notification-badge">{{ notificationCount }}</span>
      </button>
    </div>

    <!-- User Avatar Dropdown -->
    <div class="dropdown">
      <button 
        class="btn header-user d-flex align-items-center gap-3 px-3 py-1" 
        type="button" 
        id="userDropdown" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
      >
        <div class="header-avatar-wrapper position-relative">
          <div class="header-avatar" v-if="!userImage">
            <span>{{ userInitials }}</span>
          </div>
          <img v-else :src="userImage" :alt="userName" class="header-avatar-img" />
          <span class="header-online-indicator" aria-label="Online"></span>
        </div>
        <div class="header-user-info d-none d-md-flex flex-column align-items-end gap-0">
          <div class="header-user-name">{{ userName }}</div>
          <span class="header-user-role-badge">{{ userRole }}</span>
        </div>
        <i class="fa-solid fa-chevron-down header-dropdown-arrow d-none d-md-inline"></i>
      </button>

      <ul class="dropdown-menu dropdown-menu-end header-dropdown-menu shadow-sm" aria-labelledby="userDropdown">
        <li>
          <div class="dropdown-header header-dropdown-header">
            <div class="d-flex align-items-center gap-3">
              <div class="header-avatar-wrapper position-relative">
                <div class="header-avatar header-avatar-lg" v-if="!userImage">
                  <span>{{ userInitials }}</span>
                </div>
                <img v-else :src="userImage" :alt="userName" class="header-avatar-img header-avatar-img-lg" />
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
        <li>
          <a class="dropdown-item d-flex align-items-center gap-2" href="#/profile">
            <i class="fa-solid fa-user text-muted"></i>
            <span>Profile</span>
          </a>
        </li>
        <li>
          <a class="dropdown-item d-flex align-items-center gap-2" href="#/settings">
            <i class="fa-solid fa-gear text-muted"></i>
            <span>Settings</span>
          </a>
        </li>
        <li><hr class="dropdown-divider" /></li>
        <li>
          <button class="dropdown-item d-flex align-items-center gap-2 text-danger" @click="handleLogout">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</header>
`