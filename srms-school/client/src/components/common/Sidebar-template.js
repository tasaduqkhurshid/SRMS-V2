export default `
<div class="sidebar-wrap">
  <!-- overlay for mobile when sidebar is open -->
  <div v-if="mobile && mobileOpen" class="sidebar-overlay" @click="closeMobile"></div>

  <aside :class="['sidebar', { collapsed: collapsed, mobileOpen: mobileOpen && mobile }]" role="navigation" aria-label="Main navigation">
    <!-- Sidebar Header / Branding -->
    <div class="sidebar-header">
      <div class="sidebar-brand-wrapper">
        <div class="sidebar-logo">
          <img v-if="schoolLogo" :src="schoolLogo" alt="School Logo" class="sidebar-logo-img" @error="schoolLogo = ''" />
          <i v-else class="fa-solid fa-school"></i>
        </div>
        <div class="sidebar-brand-text" v-if="!collapsed">
          <div class="sidebar-brand-title">School Portal</div>
          <div class="sidebar-brand-subtitle">{{ schoolName }}</div>
        </div>
      </div>
      <button class="sidebar-toggle" type="button" :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'" @click="toggle">
        <i :class="collapsed ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-left'"></i>
      </button>
    </div>

    <hr class="sidebar-divider" />

    <!-- Navigation -->
    <nav class="nav flex-column">
      <!-- Dashboard (Active) -->
      <router-link class="nav-link" :class="{ 'nav-link-active': isActive('/dashboard') }" to="/dashboard">
        <i class="fa-solid fa-tachometer-alt"></i>
        <span v-if="!collapsed">Dashboard</span>
      </router-link>

      <!-- Students Section -->
      <div class="sidebar-section" v-if="!collapsed">
        <span class="sidebar-section-title">Students</span>
      </div>

      <router-link class="nav-link" :class="{ 'nav-link-active': isActive('/students') }" to="/students">
        <i class="fa-solid fa-user-graduate"></i>
        <span v-if="!collapsed">Students</span>
      </router-link>

      <router-link class="nav-link" :class="{ 'nav-link-active': isActive('/students/import') }" to="/students/import">
        <i class="fa-solid fa-file-import"></i>
        <span v-if="!collapsed">Import Students</span>
      </router-link>

      <!-- Academics Section -->
      <div class="sidebar-section" v-if="!collapsed">
        <span class="sidebar-section-title">Academics</span>
      </div>

      <router-link class="nav-link" :class="{ 'nav-link-active': isActive('/subjects') }" to="/subjects">
        <i class="fa-solid fa-book-open"></i>
        <span v-if="!collapsed">Subjects</span>
      </router-link>

      <router-link class="nav-link" :class="{ 'nav-link-active': isActive('/courses') }" to="/courses">
        <i class="fa-solid fa-graduation-cap"></i>
        <span v-if="!collapsed">Courses</span>
      </router-link>

      <router-link class="nav-link" :class="{ 'nav-link-active': isActive('/exams') }" to="/exams">
        <i class="fa-solid fa-file-circle-check"></i>
        <span v-if="!collapsed">Exams</span>
      </router-link>

      <!-- Results Section -->
      <div class="sidebar-section" v-if="!collapsed">
        <span class="sidebar-section-title">Results</span>
      </div>

      <div class="sidebar-group">
        <a class="nav-link" href="#" :class="{ 'nav-link-active': isActive('/results') || isActive('/results/student-wise') || isActive('/results/course-wise') || isActive('/results/subject-wise') || isActive('/results/generate') }" @click.prevent="toggleResults">
          <i class="fa-solid fa-chart-line"></i>
          <span class="flex-grow-1" v-if="!collapsed">Results</span>
          <i :class="['fa-solid fa-chevron-down nav-caret', { open: resultsOpen }]" v-if="!collapsed"></i>
        </a>
        <div :class="{ 'collapse': !resultsOpen && !collapsed }" style="overflow: hidden;">
          <router-link class="nav-link nav-link-sm" :class="{ 'nav-link-active': isActive('/results/student-wise') }" to="/results/student-wise">
            <i class="fa-solid fa-user"></i>
            <span v-if="!collapsed">Student-wise</span>
          </router-link>
          <router-link class="nav-link nav-link-sm" :class="{ 'nav-link-active': isActive('/results/course-wise') }" to="/results/course-wise">
            <i class="fa-solid fa-book"></i>
            <span v-if="!collapsed">Course-wise</span>
          </router-link>
          <router-link class="nav-link nav-link-sm" :class="{ 'nav-link-active': isActive('/results/subject-wise') }" to="/results/subject-wise">
            <i class="fa-solid fa-book-open"></i>
            <span v-if="!collapsed">Subject-wise</span>
          </router-link>
          <router-link class="nav-link nav-link-sm" :class="{ 'nav-link-active': isActive('/results/generate') }" to="/results/generate">
            <i class="fa-solid fa-file-export"></i>
            <span v-if="!collapsed">Generate Marksheet</span>
          </router-link>
        </div>
      </div>

      <div class="sidebar-group">
        <a class="nav-link" href="#" :class="{ 'nav-link-active': isActive('/results/result-book/class-wise') || isActive('/results/result-book/student-wise') }" @click.prevent="toggleResultBook">
          <i class="fa-solid fa-book"></i>
          <span class="flex-grow-1" v-if="!collapsed">Result Book</span>
          <i :class="['fa-solid fa-chevron-down nav-caret', { open: resultBookOpen }]" v-if="!collapsed"></i>
        </a>
        <div :class="{ 'collapse': !resultBookOpen && !collapsed }" style="overflow: hidden;">
          <router-link class="nav-link nav-link-sm" :class="{ 'nav-link-active': isActive('/results/result-book/class-wise') }" to="/results/result-book/class-wise">
            <i class="fa-solid fa-layer-group"></i>
            <span v-if="!collapsed">Class-wise</span>
          </router-link>
          <router-link class="nav-link nav-link-sm" :class="{ 'nav-link-active': isActive('/results/result-book/student-wise') }" to="/results/result-book/student-wise">
            <i class="fa-solid fa-user"></i>
            <span v-if="!collapsed">Student-wise</span>
          </router-link>
        </div>
      </div>

      <hr class="sidebar-divider" />

      <!-- Templates Section -->
      <div class="sidebar-section" v-if="!collapsed">
        <span class="sidebar-section-title">Templates</span>
      </div>

      <div class="sidebar-group">
        <router-link class="nav-link" :class="{ 'nav-link-active': isActive('/templates/marksheets') }" to="/templates/marksheets">
          <i class="fa-solid fa-file-lines"></i>
          <span v-if="!collapsed">Marksheets</span>
        </router-link>
      </div>

      <hr class="sidebar-divider" />

      <!-- Settings Section -->
      <div class="sidebar-section" v-if="!collapsed">
        <span class="sidebar-section-title">Settings</span>
      </div>

      <router-link class="nav-link" :class="{ 'nav-link-active': isActive('/school/profile') }" to="/school/profile">
        <i class="fa-solid fa-landmark"></i>
        <span v-if="!collapsed">School Profile</span>
      </router-link>

      <router-link class="nav-link" :class="{ 'nav-link-active': isActive('/settings') }" to="/settings">
        <i class="fa-solid fa-gear"></i>
        <span v-if="!collapsed">Settings</span>
      </router-link>

      <router-link class="nav-link" :class="{ 'nav-link-active': isActive('/backup') }" to="/backup">
        <i class="fa-solid fa-cloud-arrow-up"></i>
        <span v-if="!collapsed">Backup</span>
      </router-link>

      <!-- Divider before footer -->
      <hr class="sidebar-divider" />
    </nav>

    <!-- Sidebar Footer -->
    <div class="sidebar-footer" v-if="!collapsed">
      <div class="d-flex justify-content-between align-items-center">
        <small>v1.0.0</small>
        <small>&copy; {{ currentYear }} Hubi-Infotech</small>
      </div>
    </div>
  </aside>
</div>
`