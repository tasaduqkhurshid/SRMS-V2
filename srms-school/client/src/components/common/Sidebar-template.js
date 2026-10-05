export default `
<div class="sidebar-wrap">
  <!-- overlay for mobile when sidebar is open -->
  <div v-if="mobile && mobileOpen" class="sidebar-overlay" @click="closeMobile"></div>

  <aside :class="['sidebar', { collapsed: collapsed, mobileOpen: mobileOpen && mobile }]" role="navigation">
    <div class="sidebar-top d-flex align-items-center justify-content-between px-3 py-2">
      <div class="d-flex align-items-center">
        <i class="fa-solid fa-school fa-lg me-2"></i>
        <span class="sidebar-brand" v-if="!collapsed">School</span>
      </div>

      <!-- toggle: visible on both mobile (to close) and desktop (to collapse) -->
      <button class="btn btn-sm btn-outline-secondary sidebar-toggle mr-2 p-0" @click="toggle">
        <i :class="collapsed ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-left'"></i>
      </button>
    </div>

    <nav class="nav flex-column px-2 py-3">
      <router-link class="nav-link d-flex align-items-center" :class="{ active: isActive('/dashboard') }" to="/dashboard">
        <i class="fa-solid fa-tachometer-alt me-3"></i>
        <span v-if="!collapsed">Dashboard</span>
      </router-link>

      <router-link class="nav-link d-flex align-items-center" :class="{ active: isActive('/students') }" to="/students">
        <i class="fa-solid fa-user-graduate me-3"></i>
        <span v-if="!collapsed">Students</span>
      </router-link>

      <router-link class="nav-link d-flex align-items-center" :class="{ active: isActive('/students/import') }" to="/students/import">
        <i class="fa-solid fa-upload me-3"></i>
        <span v-if="!collapsed">Import Students</span>
      </router-link>

      <!-- Academics group (collapsible) -->
      <div class="sidebar-section px-2 pt-2 mb-2">
        <div class="d-flex align-items-center justify-content-between px-2 py-2" style="cursor: pointer;" @click="toggleAcademics">
          <div class="small" v-if="!collapsed" style="color: white;">
            <strong>ACADEMICS</strong>
          </div>
          <button class="btn btn-sm btn-link p-0" style="font-size:12px; color: white;" @click.stop="toggleAcademics" v-if="!collapsed">
            <i :class="academicsOpen ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
          </button>
        </div>

        <div :class="{ 'collapse': !academicsOpen && !collapsed }" style="overflow: hidden;">
          <router-link class="nav-link d-flex align-items-center ps-3" :class="{ active: isActive('/subjects') }" to="/subjects">
            <i class="fa-solid fa-book-open me-3"></i>
            <span v-if="!collapsed">Subjects</span>
          </router-link>

          <router-link class="nav-link d-flex align-items-center ps-3" :class="{ active: isActive('/courses') }" to="/courses">
            <i class="fa-solid fa-graduation-cap me-3"></i>
            <span v-if="!collapsed">Courses</span>
          </router-link>

          <router-link class="nav-link d-flex align-items-center ps-3" :class="{ active: isActive('/exams') }" to="/exams">
            <i class="fa-solid fa-file-circle-check me-3"></i>
            <span v-if="!collapsed">Exams</span>
          </router-link>

          <!-- Results with sub-items -->
          <div class="nav-item">
            <div class="d-flex align-items-center justify-content-between px-2 py-1" style="cursor: pointer;">
              <a class="nav-link flex-grow-1 d-flex align-items-center ps-3" :class="{ active: isActive('/results') || isActive('/results/student-wise') || isActive('/results/course-wise') || isActive('/results/subject-wise') || isActive('/results/generate') }" href="#" @click.prevent="toggleResults">
                <i class="fa-solid fa-chart-line me-3"></i>
                <span v-if="!collapsed">Results</span>
              </a>
              <button class="btn btn-sm btn-link text-secondary p-0" style="font-size:12px;" @click.prevent.stop="toggleResults" v-if="!collapsed">
                <i :class="resultsOpen ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
              </button>
            </div>

            <div :class="{ 'collapse': !resultsOpen && !collapsed }" style="overflow: hidden;">
              <router-link class="nav-link nav-link-sm d-flex align-items-center ps-5" :class="{ active: isActive('/results/student-wise') }" to="/results/student-wise">
                <i class="fa-solid fa-user me-2" style="font-size:0.85rem;"></i>
                <span v-if="!collapsed" style="font-size:0.9rem;">Student-wise</span>
              </router-link>
              <router-link class="nav-link nav-link-sm d-flex align-items-center ps-5" :class="{ active: isActive('/results/course-wise') }" to="/results/course-wise">
                <i class="fa-solid fa-book me-2" style="font-size:0.85rem;"></i>
                <span v-if="!collapsed" style="font-size:0.9rem;">Course-wise</span>
              </router-link>
              <router-link class="nav-link nav-link-sm d-flex align-items-center ps-5" :class="{ active: isActive('/results/subject-wise') }" to="/results/subject-wise">
                <i class="fa-solid fa-book-open me-2" style="font-size:0.85rem;"></i>
                <span v-if="!collapsed" style="font-size:0.9rem;">Subject-wise</span>
              </router-link>
              <router-link class="nav-link nav-link-sm d-flex align-items-center ps-5" :class="{ active: isActive('/results/generate') }" to="/results/generate">
                <i class="fa-solid fa-file-export me-2" style="font-size:0.85rem;"></i>
                <span v-if="!collapsed" style="font-size:0.9rem;">Generate Marksheet</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Result Book top-level group -->
      <a class="nav-link d-flex align-items-center" :class="{ active: isActive('/results/result-book') || isActive('/results/result-book/class-wise') || isActive('/results/result-book/student-wise') }" href="#" @click.prevent="toggleResultBook">
        <i class="fa-solid fa-book me-3"></i>
        <span v-if="!collapsed">Result Book</span>
      </a>
      <div :class="{ 'collapse': !resultBookOpen && !collapsed }" style="overflow: hidden;">
        <router-link class="nav-link nav-link-sm d-flex align-items-center ps-3" :class="{ active: isActive('/results/result-book/class-wise') }" to="/results/result-book/class-wise">
          <i class="fa-solid fa-layer-group me-2" style="font-size:0.85rem"></i>
          <span v-if="!collapsed" style="font-size:0.9rem;">Class-wise</span>
        </router-link>
        <router-link class="nav-link nav-link-sm d-flex align-items-center ps-3" :class="{ active: isActive('/results/result-book/student-wise') }" to="/results/result-book/student-wise">
          <i class="fa-solid fa-user me-2" style="font-size:0.85rem"></i>
          <span v-if="!collapsed" style="font-size:0.9rem;">Student-wise</span>
        </router-link>
      </div>

      <hr class="my-1" />

      <!-- Templates with sub-items -->
      <div class="sidebar-section px-2 pt-2 mb-2">
        <div class="d-flex align-items-center justify-content-between px-2 py-2" style="cursor: pointer;" @click="toggleTemplates">
          <div class="small" v-if="!collapsed" style="color: white;">
            <strong>TEMPLATES</strong>
          </div>
          <button class="btn btn-sm btn-link p-0" style="font-size:12px; color: white;" @click.stop="toggleTemplates" v-if="!collapsed">
            <i :class="templatesOpen ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
          </button>
        </div>

        <div :class="{ 'collapse': !templatesOpen && !collapsed }" style="overflow: hidden;">
          <router-link class="nav-link nav-link-sm d-flex align-items-center ps-3" :class="{ active: isActive('/templates/marksheets') }" to="/templates/marksheets">
            <i class="fa-solid fa-file-lines me-3" style="font-size:0.9rem;"></i>
            <span v-if="!collapsed" style="font-size:0.9rem;">Marksheets</span>
          </router-link>
        </div>
      </div>

      <hr class="my-2" />

      <router-link class="nav-link d-flex align-items-center" :class="{ active: isActive('/school/profile') }" to="/school/profile">
        <i class="fa-solid fa-landmark me-3"></i>
        <span v-if="!collapsed">School Profile</span>
      </router-link>

      <router-link class="nav-link d-flex align-items-center" :class="{ active: isActive('/settings') }" to="/settings">
        <i class="fa-solid fa-gear me-3"></i>
        <span v-if="!collapsed">Settings</span>
      </router-link>

      <router-link class="nav-link d-flex align-items-center" :class="{ active: isActive('/backup') }" to="/backup">
        <i class="fa-solid fa-cloud-arrow-up me-3"></i>
        <span v-if="!collapsed">Backup</span>
      </router-link>
    </nav>

    <div class="sidebar-bottom px-3 py-3" v-if="!collapsed">
      <small class="text-muted">v1.0 • © Hubi-Infotech</small>
    </div>
  </aside>
</div>
`
