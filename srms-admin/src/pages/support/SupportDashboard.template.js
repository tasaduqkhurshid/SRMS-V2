export default `
<section class="support-dashboard">
  <div class="section-heading">
    <div>
      <p class="eyebrow">SUPPORT MANAGEMENT</p>
      <h1>Support Tickets Dashboard</h1>
    </div>
    <router-link to="/support/tickets/create" class="primary">
      <i class="fa-solid fa-plus"></i> Create Ticket
    </router-link>
  </div>

  <div class="stats support-stats">
    <article>
      <span>Total Tickets</span>
      <strong>{{ statistics.total || 0 }}</strong>
      <small>All tickets across schools</small>
    </article>
    <article>
      <span>Pending</span>
      <strong>{{ statistics.by_status?.pending?.count || 0 }}</strong>
      <small>Awaiting assignment</small>
    </article>
    <article>
      <span>In Progress</span>
      <strong>{{ (statistics.by_status?.underwriting?.count || 0) + (statistics.by_status?.awaiting?.count || 0) }}</strong>
      <small>Underwriting + Awaiting</small>
    </article>
    <article>
      <span>Resolved</span>
      <strong>{{ statistics.by_status?.resolved?.count || 0 }}</strong>
      <small>Completed tickets</small>
    </article>
    <article>
      <span>Created Today</span>
      <strong>{{ statistics.created_today || 0 }}</strong>
      <small>New tickets in 24h</small>
    </article>
    <article>
      <span>Closed</span>
      <strong>{{ statistics.by_status?.closed?.count || 0 }}</strong>
      <small>Closed tickets</small>
    </article>
  </div>

  <div class="panel quick-actions">
    <div class="section-heading">
      <h2>Quick Actions</h2>
    </div>
    <div class="quick-actions-grid">
      <router-link to="/support/tickets" class="quick-action-card">
        <i class="fa-solid fa-ticket"></i>
        <div>
          <h3>All Tickets</h3>
          <p>View and manage all support tickets</p>
        </div>
      </router-link>
      <router-link to="/support/tickets/create" class="quick-action-card">
        <i class="fa-solid fa-plus"></i>
        <div>
          <h3>Create Ticket</h3>
          <p>Create a ticket on behalf of a school</p>
        </div>
      </router-link>
      <router-link to="/support/subjects" class="quick-action-card">
        <i class="fa-solid fa-gears"></i>
        <div>
          <h3>Configuration</h3>
          <p>Manage subjects, services, and statuses</p>
        </div>
      </router-link>
    </div>
  </div>
</section>`;
