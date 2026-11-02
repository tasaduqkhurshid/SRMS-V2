export default `<aside class="sidebar">
  <RouterLink class="brand" to="/dashboard"><span class="sidebar-logo"><SMSBrand layout="mark" variant="dark" label="SMS logo" /></span><span>SMS<small>Education Platform</small></span></RouterLink>
    <nav>
      <RouterLink to="/dashboard" active-class="active">Overview</RouterLink>
      <RouterLink to="/schools" active-class="active">Schools</RouterLink>
      <RouterLink to="/payment-gateways" active-class="active">Payment gateways</RouterLink>
      <div class="sidebar-divider"></div>
      <RouterLink to="/support/tickets" active-class="active">Support Tickets</RouterLink>
      <RouterLink to="/support/subjects" active-class="active">Subjects</RouterLink>
      <RouterLink to="/support/services" active-class="active">Services</RouterLink>
      <RouterLink to="/support/statuses" active-class="active">Statuses</RouterLink>
    </nav>
    <button class="logout" @click="$emit('logout')">Sign out</button>
    <small class="sidebar-copyright">© {{ currentYear }} Hubi-Infotech</small>
  </aside>`;
