export default `
<div class="support-tickets-page">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h1 class="h3 mb-1">All Tickets</h1>
      <p class="text-muted mb-0">Manage and track your support tickets</p>
    </div>
    <button class="btn btn-primary" @click="createTicket">
      <i class="fa-solid fa-plus me-1"></i> Create Ticket
    </button>
  </div>

  <!-- Filters Card -->
  <div class="card mb-4">
    <div class="card-body">
      <form @submit.prevent="applyFilters" class="row g-3">
        <div class="col-md-3">
          <label class="form-label visually-hidden" for="ticketSearch">Search tickets</label>
          <div class="input-group">
            <span class="input-group-text bg-transparent border-end-0">
              <i class="fa-solid fa-magnifying-glass text-muted"></i>
            </span>
            <input
              id="ticketSearch"
              type="search"
              class="form-control border-start-0"
              v-model="searchTerm"
              placeholder="Search ticket #, title..."
              @keydown.enter="applyFilters"
            />
          </div>
        </div>

        <div class="col-md-2">
          <label class="form-label visually-hidden" for="statusFilter">Status</label>
          <select id="statusFilter" class="form-select" v-model="statusFilter" @change="applyFilters">
            <option value="">All Statuses</option>
            <option v-for="s in statuses" :key="s._id" :value="s._id">{{ s.name }}</option>
          </select>
        </div>

        <div class="col-md-2">
          <label class="form-label visually-hidden" for="subjectFilter">Subject</label>
          <select id="subjectFilter" class="form-select" v-model="subjectFilter" @change="applyFilters">
            <option value="">All Subjects</option>
            <option v-for="s in subjects" :key="s._id" :value="s._id">{{ s.name }}</option>
          </select>
        </div>

        <div class="col-md-2">
          <label class="form-label visually-hidden" for="serviceFilter">Service</label>
          <select id="serviceFilter" class="form-select" v-model="serviceFilter" @change="applyFilters">
            <option value="">All Services</option>
            <option v-for="s in services" :key="s._id" :value="s._id">{{ s.name }}</option>
          </select>
        </div>

        <div class="col-md-2">
          <label class="form-label visually-hidden" for="priorityFilter">Priority</label>
          <select id="priorityFilter" class="form-select" v-model="priorityFilter" @change="applyFilters">
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div class="col-md-2">
          <label class="form-label visually-hidden" for="dateFrom">From Date</label>
          <input id="dateFrom" type="date" class="form-control" v-model="dateFrom" @change="applyFilters" />
        </div>

        <div class="col-md-2">
          <label class="form-label visually-hidden" for="dateTo">To Date</label>
          <input id="dateTo" type="date" class="form-control" v-model="dateTo" @change="applyFilters" />
        </div>

        <div class="col-12 d-flex gap-2">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
            <i class="fa-solid fa-filter me-1" v-else></i>
            Apply Filters
          </button>
          <button type="button" class="btn btn-outline-secondary" @click="clearFilters" :disabled="!hasActiveFilters">
            <i class="fa-solid fa-rotate-left me-1"></i> Clear
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Tickets Table -->
  <div class="card">
    <div v-if="loading && !tickets.length" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-3 mb-0">Loading tickets…</p>
    </div>

    <div v-else class="table-responsive">
      <table class="table table-hover mb-0">
        <thead>
          <tr>
            <th style="width: 50px;">#</th>
            <th :aria-sort="sortKey === 'ticket_number' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'">
              <button class="btn btn-link text-decoration-none text-dark p-0" @click="toggleSort('ticket_number')">
                Ticket ID <i :class="['fa-solid ms-1', sortIndicator('ticket_number')]"></i>
              </button>
            </th>
            <th :aria-sort="sortKey === 'subject' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'">
              <button class="btn btn-link text-decoration-none text-dark p-0" @click="toggleSort('subject')">
                Subject <i :class="['fa-solid ms-1', sortIndicator('subject')]"></i>
              </button>
            </th>
            <th :aria-sort="sortKey === 'service' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'">
              <button class="btn btn-link text-decoration-none text-dark p-0" @click="toggleSort('service')">
                Service <i :class="['fa-solid ms-1', sortIndicator('service')]"></i>
              </button>
            </th>
            <th :aria-sort="sortKey === 'title' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'">
              <button class="btn btn-link text-decoration-none text-dark p-0" @click="toggleSort('title')">
                Title <i :class="['fa-solid ms-1', sortIndicator('title')]"></i>
              </button>
            </th>
            <th style="min-width: 130px;" :aria-sort="sortKey === 'status' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'">
              <button class="btn btn-link text-decoration-none text-dark p-0" @click="toggleSort('status')">
                Status <i :class="['fa-solid ms-1', sortIndicator('status')]"></i>
              </button>
            </th>
            <th style="min-width: 100px;" :aria-sort="sortKey === 'priority' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'">
              <button class="btn btn-link text-decoration-none text-dark p-0" @click="toggleSort('priority')">
                Priority <i :class="['fa-solid ms-1', sortIndicator('priority')]"></i>
              </button>
            </th>
            <th style="min-width: 130px;" :aria-sort="sortKey === 'created_at' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'">
              <button class="btn btn-link text-decoration-none text-dark p-0" @click="toggleSort('created_at')">
                Created <i :class="['fa-solid ms-1', sortIndicator('created_at')]"></i>
              </button>
            </th>
            <th style="min-width: 130px;" :aria-sort="sortKey === 'updated_at' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'">
              <button class="btn btn-link text-decoration-none text-dark p-0" @click="toggleSort('updated_at')">
                Updated <i :class="['fa-solid ms-1', sortIndicator('updated_at')]"></i>
              </button>
            </th>
            <th class="text-end" style="width: 100px;">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(ticket, index) in tickets" :key="ticket._id">
            <td class="text-muted fw-medium">{{ (meta.page - 1) * meta.limit + index + 1 }}</td>
            <td class="fw-monospace">{{ ticket.ticket_number }}</td>
            <td>{{ ticket.subject?.name || '—' }}</td>
            <td>{{ ticket.service?.name || '—' }}</td>
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
            <td class="text-muted">{{ formatDate(ticket.created_at) }}</td>
            <td class="text-muted">{{ formatDate(ticket.updated_at) }}</td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-primary" @click="viewTicket(ticket._id)">
                View
              </button>
            </td>
          </tr>

          <tr v-if="!tickets.length && !loading">
            <td colspan="10" class="text-center py-5">
              <div class="empty-state">
                <div class="empty-state-icon"><i class="fa-solid fa-ticket"></i></div>
                <p class="empty-state-text" v-if="hasActiveFilters">No tickets match your filters</p>
                <p class="empty-state-text" v-else>No tickets found</p>
                <p class="empty-state-subtext" v-if="hasActiveFilters">Try adjusting your search or filters</p>
                <p class="empty-state-subtext" v-else>Get started by creating your first ticket</p>
                <button class="btn btn-primary mt-2" @click="createTicket" v-if="!hasActiveFilters">
                  <i class="fa-solid fa-plus me-1"></i> Create Ticket
                </button>
                <button class="btn btn-outline-secondary mt-2" @click="clearFilters" v-if="hasActiveFilters">
                  <i class="fa-solid fa-xmark me-1"></i> Clear Filters
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card-footer d-flex flex-wrap justify-content-between align-items-center gap-3">
      <div class="text-muted small">{{ showingRange }}</div>
      <nav class="d-flex align-items-center gap-2" aria-label="Pagination">
        <button class="btn btn-sm" :disabled="meta.page <= 1" @click="prev" aria-label="Previous page">
          <i class="fa-solid fa-chevron-left me-1"></i> Previous
        </button>
        <span class="px-2" aria-current="page">Page {{ meta.page }} of {{ meta.pages }}</span>
        <button class="btn btn-sm" :disabled="meta.page >= meta.pages" @click="next" aria-label="Next page">
          Next <i class="fa-solid fa-chevron-right ms-1"></i>
        </button>
        <div class="vr mx-2 d-none d-sm-block"></div>
        <select class="form-select form-select-sm" style="width: auto; min-width: 80px;" :value="meta.limit" @change="changePageSize($event.target.value)" aria-label="Rows per page">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </nav>
    </div>
  </div>
</div>
`;