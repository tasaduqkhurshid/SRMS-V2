export default `<aside class="sidebar">
  <RouterLink class="brand" to="/dashboard"><span class="sidebar-logo"><SMSBrand layout="mark" variant="dark" label="SMS logo" /></span><span>SMS<small>Education Platform</small></span></RouterLink>
    <nav><RouterLink to="/dashboard" active-class="active">Overview</RouterLink><RouterLink to="/schools" active-class="active">Schools</RouterLink></nav>
    <button class="logout" @click="$emit('logout')">Sign out</button>
    <small class="sidebar-copyright">© {{ currentYear }} Hubi-Infotech</small>
  </aside>`;
