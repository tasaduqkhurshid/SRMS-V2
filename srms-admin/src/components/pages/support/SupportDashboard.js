export default {
  name: 'SupportDashboard',
  props: {
    statistics: { type: Object, required: true },
  },
  template: `
    <div class="support-dashboard-admin">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-1">Support Management</h1>
          <p class="text-muted mb-0">Manage support tickets across all schools</p>
        </div>
        <router-link to="/support/tickets/create" class="btn btn-primary">
          <i class="fa-solid fa-plus me-1"></i> Create Ticket for School
        </router-link>
      </div>

      <!-- Stats Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-6 col-lg-2">
          <div class="card stat-card stat-total">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="stat-icon"><i class="fa-solid fa-ticket"></i></div>
                <div class="ms-3">
                  <div class="stat-value">{{ statistics.total || 0 }}</div>
                  <div class="stat-label">Total Tickets</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-2">
          <div class="card stat-card stat-pending">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="stat-icon"><i class="fa-solid fa-clock"></i></div>
                <div class="ms-3">
                  <div class="stat-value">{{ statistics.by_status?.pending?.count || 0 }}</div>
                  <div class="stat-label">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-2">
          <div class="card stat-card stat-awaiting">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="stat-icon"><i class="fa-solid fa-hourglass-half"></i></div>
                <div class="ms-3">
                  <div class="stat-value">{{ statistics.by_status?.awaiting?.count || 0 }}</div>
                  <div class="stat-label">Awaiting</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-2">
          <div class="card stat-card stat-underwriting">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="stat-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
                <div class="ms-3">
                  <div class="stat-value">{{ statistics.by_status?.underwriting?.count || 0 }}</div>
                  <div class="stat-label">Underwriting</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-2">
          <div class="card stat-card stat-resolved">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="stat-icon"><i class="fa-solid fa-check-circle"></i></div>
                <div class="ms-3">
                  <div class="stat-value">{{ statistics.by_status?.resolved?.count || 0 }}</div>
                  <div class="stat-label">Resolved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-2">
          <div class="card stat-card stat-today">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="stat-icon"><i class="fa-solid fa-calendar-day"></i></div>
                <div class="ms-3">
                  <div class="stat-value">{{ statistics.created_today || 0 }}</div>
                  <div class="stat-label">Created Today</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card quick-action-card">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="quick-action-icon"><i class="fa-solid fa-ticket"></i></div>
                <div class="ms-3">
                  <h6 class="mb-1">All Tickets</h6>
                  <p class="text-muted small mb-0">View and manage all support tickets</p>
                </div>
              </div>
              <router-link to="/support/tickets" class="stretched-link"></router-link>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card quick-action-card">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="quick-action-icon"><i class="fa-solid fa-plus"></i></div>
                <div class="ms-3">
                  <h6 class="mb-1">Create Ticket</h6>
                  <p class="text-muted small mb-0">Create a ticket on behalf of a school</p>
                </div>
              </div>
              <router-link to="/support/tickets/create" class="stretched-link"></router-link>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card quick-action-card">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="quick-action-icon"><i class="fa-solid fa-gears"></i></div>
                <div class="ms-3">
                  <h6 class="mb-1">Configuration</h6>
                  <p class="text-muted small mb-0">Manage subjects, services, and statuses</p>
                </div>
              </div>
              <router-link to="/support/subjects" class="stretched-link"></router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
}