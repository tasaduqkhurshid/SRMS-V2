export default `<aside class="sidebar">
  <RouterLink class="brand" to="/dashboard"><span class="sidebar-logo"><SMSBrand layout="mark" variant="dark" label="SMS logo" /></span><span>SMS<small>Education Platform</small></span></RouterLink>
    <nav>
      <RouterLink to="/dashboard" active-class="active" @click="closeSupportMenu">Overview</RouterLink>
      <RouterLink to="/schools" active-class="active" @click="closeSupportMenu">Schools</RouterLink>
      <RouterLink to="/payment-gateways" active-class="active" @click="closeSupportMenu">Payment gateways</RouterLink>
      <div class="sidebar-divider"></div>

      <!-- Support Tickets Submenu -->
      <div class="sidebar-submenu">
        <button type="button" class="sidebar-submenu-toggle" :class="{ 'active': supportMenuOpen }" @click="toggleSupportMenu">
          <span>Support Tickets</span>
          <i class="fa-solid fa-chevron-down" :class="{ 'rotated': supportMenuOpen }"></i>
        </button>
        <ul class="sidebar-submenu-items" v-show="supportMenuOpen">
          <li><RouterLink to="/support/dashboard" active-class="active" @click="closeSupportMenu">Dashboard</RouterLink></li>
          <li><RouterLink to="/support/tickets" active-class="active" @click="closeSupportMenu">Tickets</RouterLink></li>
        </ul>
      </div>
      <div class="sidebar-divider"></div>
    </nav>
    <button class="logout" @click="$emit('logout')">Sign out</button>
    <small class="sidebar-copyright">© {{ currentYear }} Hubi-Infotech</small>
  </aside>`;
