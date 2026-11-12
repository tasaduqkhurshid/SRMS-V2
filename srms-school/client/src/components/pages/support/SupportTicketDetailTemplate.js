export default `
<div class="ticket-detail-page">
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
        <h1 class="h3 mb-1">{{ ticket.subject?.name || ticket.title }}</h1>
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
      <div class="col-12">
        <!-- Ticket Info Card (outer) -->
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Ticket Info</h5>
            <span class="badge" :class="getStatusBadgeClass(ticket.status?.code)">{{ ticket.status?.name }}</span>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <!-- Sub card 1 -->
              <div class="col-md-6">
                <div class="card" style="border:none; box-shadow:none; height:100%;">
                  <div class="card-body p-0">
                    <div class="ticket-info-grid">
                      <div class="ticket-info-item" style="display: flex; align-items: center; gap: 8px; font-size: 13px;">
                        <span class="label" style="color: #6c757d; font-size: 12px;">Ticket ID</span>
                        <span class="divider" style="color: #adb5bd; font-weight: bold;">:-</span>
                        <span class="value fw-monospace">{{ ticket.ticket_number }}</span>
                      </div>
                      <div class="ticket-info-item" style="display: flex; align-items: center; gap: 8px; font-size: 13px;">
                        <span class="label" style="color: #6c757d; font-size: 12px;">Subject</span>
                        <span class="divider" style="color: #adb5bd; font-weight: bold;">:-</span>
                        <span class="value">{{ ticket.subject?.name || '—' }}</span>
                      </div>
                      <div class="ticket-info-item" style="display: flex; align-items: center; gap: 8px; font-size: 13px;">
                        <span class="label" style="color: #6c757d; font-size: 12px;">Service</span>
                        <span class="divider" style="color: #adb5bd; font-weight: bold;">:-</span>
                        <span class="value">{{ ticket.service?.name || '—' }}</span>
                      </div>
                      <div class="ticket-info-item" style="display: flex; align-items: center; gap: 8px; font-size: 13px;">
                        <span class="label" style="color: #6c757d; font-size: 12px;">Module</span>
                        <span class="divider" style="color: #adb5bd; font-weight: bold;">:-</span>
                        <span class="value">{{ ticket.module || '—' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sub card 2 -->
              <div class="col-md-6">
                <div class="card" style="border:none; box-shadow:none; height:100%;">
                  <div class="card-body p-0">
                    <div class="ticket-info-grid">
                  <div class="ticket-info-item" style="display: flex; align-items: center; gap: 8px; font-size: 13px;">
                    <span class="label" style="color: #6c757d; font-size: 12px;">Priority</span>
                    <span class="divider" style="color: #adb5bd; font-weight: bold;">:-</span>
                    <span class="value"><span class="badge" :class="getPriorityBadgeClass(ticket.priority)">{{ ticket.priority }}</span></span>
                  </div>
                      <div class="ticket-info-item" style="display: flex; align-items: center; gap: 8px; font-size: 13px;">
                        <span class="label" style="color: #6c757d; font-size: 12px;">Created</span>
                        <span class="divider" style="color: #adb5bd; font-weight: bold;">:-</span>
                        <span class="value">{{ formatDate(ticket.created_at) }}</span>
                      </div>
                      <div class="ticket-info-item" style="display: flex; align-items: center; gap: 8px; font-size: 13px;">
                        <span class="label" style="color: #6c757d; font-size: 12px;">Updated</span>
                        <span class="divider" style="color: #adb5bd; font-weight: bold;">:-</span>
                        <span class="value">{{ formatDate(ticket.updated_at) }}</span>
                      </div>
                      <div class="ticket-info-item" v-if="ticket.last_reply_at" style="display: flex; align-items: center; gap: 8px; font-size: 13px;">
                        <span class="label" style="color: #6c757d; font-size: 12px;">Last Reply</span>
                        <span class="divider" style="color: #adb5bd; font-weight: bold;">:-</span>
                        <span class="value">{{ formatDateTime(ticket.last_reply_at) }}</span>
                      </div>
                      <div class="ticket-info-item" v-if="ticket.resolved_at" style="display: flex; align-items: center; gap: 8px; font-size: 13px;">
                        <span class="label" style="color: #6c757d; font-size: 12px;">Resolved</span>
                        <span class="divider" style="color: #adb5bd; font-weight: bold;">:-</span>
                        <span class="value">{{ formatDateTime(ticket.resolved_at) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Conversation Card -->
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Conversation</h5>
            <span class="badge bg-secondary">{{ messages.length }} message{{ messages.length !== 1 ? 's' : '' }}</span>
          </div>
          <div class="card-body p-0">
            <div class="conversation-timeline">
              <div v-for="(msg, index) in messages" :key="msg._id || index" class="card p-3 m-2 shadow-sm" style="margin-left: 20px; margin-right: 20px;">
                <div class="msg-header d-flex justify-content-between align-items-start mb-1">
                  <div class="d-flex align-items-center gap-2 flex-wrap">
                    <strong class="msg-sender">{{ msg.sender_name }}</strong>
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
                <div class="msg-body mt-1" style="text-align: left;">{{ msg.message }}</div>
                <div v-if="msg.attachments && msg.attachments.length" class="mt-2">
                  <div v-for="att in msg.attachments" :key="att.file_key" class="attachment-item d-flex align-items-center gap-2 p-2 border rounded bg-light">
                    <i class="fa-solid fa-file text-primary"></i>
                    <a :href="att.file_url" target="_blank" class="text-decoration-none">{{ att.file_name }}</a>
                    <span class="text-muted small">({{ formatFileSize(att.size) }})</span>
                  </div>
                </div>
              </div>

              <div v-if="!messages.length" class="text-center py-5 text-muted">
                <i class="fa-solid fa-comment fa-2x mb-2 d-block"></i>
                No messages yet
              </div>
            </div>

            <!-- Reply Form -->
            <div class="card-footer border-top" v-if="!isResolved" style="padding-top: 0;">
              <div class="reply-form p-3">
                <textarea
                  class="form-control mb-2"
                  v-model="replyText"
                  rows="3"
                  placeholder="Type your reply..."
                  @keydown.ctrl.enter="submitReply"
                ></textarea>
                <div class="d-flex justify-content-end">
                  <button class="btn btn-primary" @click="submitReply" :disabled="submitting || !replyText.trim()">
                    <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                    <i class="fa-solid fa-reply me-1" v-else></i>
                    {{ submitting ? 'Sending...' : 'Send Reply' }}
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="card-footer border-top text-center text-muted py-3">
              <i class="fa-solid fa-lock me-1"></i>
              This ticket has been resolved. You cannot reply to a resolved ticket.
              <br>
              <small>Contact support if you need to reopen this ticket.</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`;
