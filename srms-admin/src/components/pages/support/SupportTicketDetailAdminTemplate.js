export default `<div class="ticket-detail-admin-page">
  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>

  <div v-else-if="error" class="alert alert-danger">
    {{ error }}
    <button class="btn btn-outline-secondary btn-sm ms-2" @click="goBack">
      <i class="fa-solid fa-arrow-left me-1"></i> Back
    </button>
  </div>

  <div v-else-if="ticket">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">{{ ticket.title }}</h1>
        <div class="d-flex flex-wrap gap-2 align-items-center">
          <span class="badge" :class="getStatusBadgeClass(ticket.status?.code)">
            {{ ticket.status?.name }}
          </span>
          <span class="badge" :class="getPriorityBadgeClass(ticket.priority)">
            {{ ticket.priority }}
          </span>
          <span class="text-muted fw-monospace small">{{ ticket.ticket_number }}</span>
        </div>
      </div>
      <button class="btn btn-outline-secondary" @click="goBack">
        <i class="fa-solid fa-arrow-left me-1"></i> Back
      </button>
    </div>

    <div class="row">
      <div class="col-lg-8">
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Issue Details</h5>
          </div>
          <div class="card-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label text-muted small">School</label>
                <div>{{ ticket.school?.school_name || '—' }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted small">Subject</label>
                <div>{{ ticket.subject?.name || '—' }}</div>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label text-muted small">Service</label>
                <div>{{ ticket.service?.name || '—' }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted small">Module</label>
                <div>{{ ticket.module || '—' }}</div>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label text-muted small">Created By</label>
                <div>{{ ticket.created_by?.name }} ({{ ticket.created_by?.role }})</div>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted small">Created</label>
                <div>{{ formatDateTime(ticket.created_at) }}</div>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label text-muted small">Last Updated</label>
                <div>{{ formatDateTime(ticket.updated_at) }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted small" v-if="ticket.resolved_at">Resolved</label>
                <div v-if="ticket.resolved_at">{{ formatDateTime(ticket.resolved_at) }}</div>
              </div>
            </div>
            <hr />
            <div>
              <label class="form-label text-muted small">Description</label>
              <div class="ticket-description">{{ ticket.description }}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Conversation</h5>
            <span class="badge bg-secondary">{{ messages.length }} message{{ messages.length !== 1 ? 's' : '' }}</span>
          </div>
          <div class="card-body p-0">
            <div class="conversation-timeline">
              <div v-for="(msg, index) in messages" :key="msg._id || index" class="timeline-item" :class="getMessageTypeClass(msg.message_type)">
                <div class="timeline-marker">
                  <div class="marker-dot" :class="msg.message_type === 'system_activity' ? 'system' : (msg.message_type === 'internal_note' ? 'internal' : (msg.sender_portal === 'admin' ? 'admin' : 'school'))"></div>
                </div>
                <div class="timeline-content">
                  <div class="timeline-header d-flex justify-content-between align-items-start">
                    <div>
                      <div class="d-flex align-items-center gap-2 flex-wrap">
                        <strong>{{ msg.sender_name }}</strong>
                        <span class="badge" :class="getSenderBadgeClass(msg.sender_portal)">
                          {{ msg.sender_portal === 'admin' ? 'Super Admin' : 'School' }}
                        </span>
                        <span v-if="msg.message_type === 'internal_note'" class="badge badge-internal">
                          <i class="fa-solid fa-lock me-1"></i> Internal Note
                        </span>
                        <span v-else-if="msg.message_type === 'system_activity'" class="badge badge-system">
                          <i class="fa-solid fa-gear me-1"></i> System
                        </span>
                      </div>
                      <div class="text-muted small">{{ formatDateTime(msg.created_at) }}</div>
                    </div>
                  </div>
                  <div class="timeline-message mt-2">{{ msg.message }}</div>
                  
                  <div v-if="msg.attachments && msg.attachments.length" class="attachments mt-3">
                    <div v-for="att in msg.attachments" :key="att.file_key" class="attachment-item d-flex align-items-center gap-2 p-2 border rounded bg-light">
                      <i class="fa-solid fa-file text-primary"></i>
                      <a :href="att.file_url" target="_blank" class="text-decoration-none">{{ att.file_name }}</a>
                      <span class="text-muted small">({{ formatFileSize(att.size) }})</span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="!messages.length" class="text-center py-5 text-muted">
                <i class="fa-solid fa-comment fa-2x mb-2 d-block"></i>
                No messages yet
              </div>
            </div>

            <div class="card-footer border-top">
              <div class="reply-form">
                <div class="d-flex gap-2 mb-2">
                  <select class="form-select" v-model="replyType" style="width: auto; min-width: 160px;">
                    <option value="reply">Public Reply</option>
                    <option value="internal_note">Internal Note</option>
                  </select>
                </div>
                <textarea
                  class="form-control mb-2"
                  v-model="replyText"
                  rows="3"
                  :placeholder="replyType === 'internal_note' ? 'Type internal note (only visible to admin)...' : 'Type your reply (visible to school)...'"
                ></textarea>
                <div class="d-flex justify-content-end">
                  <button class="btn btn-primary" @click="submitReply" :disabled="submitting || !replyText.trim()">
                    <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                    <i class="fa-solid" :class="replyType === 'internal_note' ? 'fa-lock me-1' : 'fa-reply me-1'" v-else></i>
                    {{ submitting ? 'Sending...' : (replyType === 'internal_note' ? 'Add Internal Note' : 'Send Reply') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      <div class="col-lg-4">
        <div class="card sticky-top mb-3" style="top: 20px;">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Ticket Info</h5>
            <button class="btn btn-sm btn-outline-primary" @click="openStatusModal">
              <i class="fa-solid fa-exchange-alt me-1"></i> Change Status
            </button>
          </div>
          <div class="card-body">
            <dl class="row mb-0 small">
              <dt class="col-5 text-muted">Ticket ID</dt>
              <dd class="col-7 fw-monospace">{{ ticket.ticket_number }}</dd>

              <dt class="col-5 text-muted">School</dt>
              <dd class="col-7">{{ ticket.school?.school_name || '—' }}</dd>

              <dt class="col-5 text-muted">Subject</dt>
              <dd class="col-7">{{ ticket.subject?.name || '—' }}</dd>

              <dt class="col-5 text-muted">Service</dt>
              <dd class="col-7">{{ ticket.service?.name || '—' }}</dd>

              <dt class="col-5 text-muted">Module</dt>
              <dd class="col-7">{{ ticket.module || '—' }}</dd>

              <dt class="col-5 text-muted">Status</dt>
              <dd class="col-7">
                <span class="badge" :class="getStatusBadgeClass(ticket.status?.code)">
                  {{ ticket.status?.name }}
                </span>
              </dd>

              <dt class="col-5 text-muted">Priority</dt>
              <dd class="col-7">
                <span class="badge" :class="getPriorityBadgeClass(ticket.priority)">
                  {{ ticket.priority }}
                </span>
              </dd>

              <dt class="col-5 text-muted">Created</dt>
              <dd class="col-7">{{ formatDate(ticket.created_at) }}</dd>

              <dt class="col-5 text-muted">Updated</dt>
              <dd class="col-7">{{ formatDate(ticket.updated_at) }}</dd>

              <dt class="col-5 text-muted" v-if="ticket.last_reply_at">Last Reply</dt>
              <dd class="col-7" v-if="ticket.last_reply_at">{{ formatDateTime(ticket.last_reply_at) }}</dd>

              <dt class="col-5 text-muted" v-if="ticket.resolved_at">Resolved</dt>
              <dd class="col-7" v-if="ticket.resolved_at">{{ formatDateTime(ticket.resolved_at) }}</dd>

              <dt class="col-5 text-muted">Created By</dt>
              <dd class="col-7">{{ ticket.created_by?.name }} ({{ ticket.created_by?.role }})</dd>
            </dl>
          </div>
        </div>

        <div class="card sticky-top" style="top: 20px;">
          <div class="card-header">
            <h5 class="mb-0">Actions</h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <button class="btn btn-outline-primary" @click="openStatusModal" :disabled="loading">
                <i class="fa-solid fa-exchange-alt me-2"></i> Change Status
              </button>
              <button v-if="!isResolved" class="btn btn-success" @click="resolveTicket" :disabled="loading">
                <i class="fa-solid fa-check-circle me-2"></i> Resolve Ticket
              </button>
              <button v-if="isResolved" class="btn btn-warning" @click="reopenTicket" :disabled="loading">
                <i class="fa-solid fa-rotate-left me-2"></i> Reopen Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showStatusModal" class="modal-overlay" @click.self="showStatusModal = false">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Change Ticket Status</h5>
            <button type="button" class="btn-close" @click="showStatusModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">New Status</label>
              <select class="form-select" v-model="selectedStatusId">
                <option v-for="s in statuses" :key="s._id" :value="s._id" :disabled="s._id === ticket?.status_id">
                  {{ s.name }} {{ s._id === ticket?.status_id ? '(current)' : '' }}
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showStatusModal = false">Cancel</button>
            <button class="btn btn-primary" @click="changeStatus" :disabled="!selectedStatusId">Change Status</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;