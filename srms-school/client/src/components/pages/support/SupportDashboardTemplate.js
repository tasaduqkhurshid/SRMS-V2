export default `
<div class="support-dashboard">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h1 class="h3 mb-1">Support Center</h1>
      <p class="text-muted mb-0">Track and manage your support tickets</p>
    </div>
    <router-link to="/support/tickets/create" class="btn btn-primary">
      <i class="fa-solid fa-plus me-1"></i> Create Ticket
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
              <div class="stat-value">{{ stats.total }}</div>
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
              <div class="stat-value">{{ stats.pending }}</div>
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
              <div class="stat-value">{{ stats.awaiting }}</div>
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
              <div class="stat-value">{{ stats.underwriting }}</div>
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
              <div class="stat-value">{{ stats.resolved }}</div>
              <div class="stat-label">Resolved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Recent Tickets -->
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Recent Tickets</h5>
      <router-link to="/support/tickets" class="btn btn-sm btn-outline-primary">View All</router-link>
    </div>
    <div class="card-body p-0">
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else-if="!recentTickets.length" class="text-center py-4">
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fa-solid fa-ticket"></i></div>
          <p class="empty-state-text">No tickets found</p>
          <p class="empty-state-subtext">Create your first support ticket</p>
          <router-link to="/support/tickets/create" class="btn btn-primary mt-2">
            <i class="fa-solid fa-plus me-1"></i> Create Ticket
          </router-link>
        </div>
      </div>
      <div v-else class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Subject</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Created</th>
              <th class="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in recentTickets" :key="ticket._id" @click="goToTicket(ticket._id)" style="cursor: pointer;">
              <td class="fw-monospace">{{ ticket.ticket_number }}</td>
              <td>{{ ticket.subject?.name || '—' }}</td>
              <td>{{ ticket.title }}</td>
              <td>
                <span class="badge" :class="getStatusBadgeClass(ticket.status?.code)">
                  {{ ticket.status?.name || '—' }}
                </span>
              </td>
              <td>
                <span class="badge" :class="getPriorityBadgeClass(ticket.priority)">
                  {{ ticket.priority }}
                </span>
              </td>
              <td>{{ formatDate(ticket.created_at) }}</td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-primary" @click.stop="goToTicket(ticket._id)">
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
`;