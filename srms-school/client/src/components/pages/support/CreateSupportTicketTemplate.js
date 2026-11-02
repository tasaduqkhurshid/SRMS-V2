export default `
<div class="create-ticket-page">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h1 class="h3 mb-1">Create Support Ticket</h1>
      <p class="text-muted mb-0">Submit a new support request</p>
    </div>
    <button class="btn btn-outline-secondary" @click="goBack">
      <i class="fa-solid fa-arrow-left me-1"></i> Back to Tickets
    </button>
  </div>

  <div class="row">
    <div class="col-lg-8">
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">Ticket Details</h5>
        </div>
        <div class="card-body">
          <p v-if="error" class="alert alert-danger">{{ error }}</p>
          <p v-if="success" class="alert alert-success">{{ success }}</p>

          <div class="mb-3">
            <label class="form-label required" for="subject">Subject <span class="text-danger">*</span></label>
            <select id="subject" class="form-select" v-model="form.subject_id" required>
              <option value="">Select a subject</option>
              <option v-for="s in subjects" :key="s._id" :value="s._id">{{ s.name }}</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label" for="service">Service</label>
            <select id="service" class="form-select" v-model="form.service_id">
              <option value="">Select a service (optional)</option>
              <option v-for="s in services" :key="s._id" :value="s._id">{{ s.name }}</option>
            </select>
            <div class="form-text">Select a service if your issue is related to a specific integration or service</div>
          </div>

          <div class="mb-3">
            <label class="form-label" for="module">Affected Module</label>
            <input
              id="module"
              type="text"
              class="form-control"
              v-model="form.module"
              placeholder="e.g., Payment Gateway, Student Portal, Examination Module"
            />
            <div class="form-text">Specify the module or area affected (optional)</div>
          </div>

          <div class="mb-3">
            <label class="form-label required" for="title">Title <span class="text-danger">*</span></label>
            <input
              id="title"
              type="text"
              class="form-control"
              v-model="form.title"
              placeholder="Brief summary of the issue"
              maxlength="200"
              required
            />
          </div>

          <div class="mb-3">
            <label class="form-label required" for="description">Description <span class="text-danger">*</span></label>
            <textarea
              id="description"
              class="form-control"
              v-model="form.description"
              rows="6"
              placeholder="Describe the issue in detail. Include steps to reproduce, error messages, and any other relevant information."
              required
            ></textarea>
          </div>

          <div class="mb-3">
            <label class="form-label" for="priority">Priority</label>
            <select id="priority" class="form-select" v-model="form.priority">
              <option value="low">Low</option>
              <option value="medium" selected>Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Attachments -->
      <div class="card mt-4">
        <div class="card-header">
          <h5 class="mb-0">Attachments</h5>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label" for="attachments">Upload Files</label>
            <input
              id="attachments"
              type="file"
              class="form-control"
              multiple
              @change="handleFileChange"
              accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.txt,.doc,.docx"
            />
            <div class="form-text">Maximum 5 files, 10MB each. Allowed: JPEG, PNG, WebP, GIF, PDF, TXT, DOC, DOCX</div>
          </div>

          <div v-if="attachments.length" class="attachments-list">
            <div v-for="(att, index) in attachments" :key="index" class="attachment-item d-flex align-items-center justify-content-between p-2 border rounded mb-2">
              <div class="d-flex align-items-center">
                <i class="fa-solid fa-file me-2 text-primary"></i>
                <div>
                  <div class="fw-medium">{{ att.name }}</div>
                  <div class="text-muted small">{{ formatFileSize(att.size) }} · {{ att.type }}</div>
                </div>
              </div>
              <button type="button" class="btn btn-sm btn-outline-danger" @click="removeAttachment(index)" aria-label="Remove attachment">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          <div v-else class="text-center py-3 text-muted">
            <i class="fa-solid fa-cloud-upload-alt fa-2x mb-2 d-block"></i>
            No files attached
          </div>
        </div>
      </div>
    </div>

    <div class="col-lg-4">
      <div class="card sticky-top" style="top: 20px;">
        <div class="card-header">
          <h5 class="mb-0">Guidelines</h5>
        </div>
        <div class="card-body">
          <ul class="mb-0 small">
            <li class="mb-2">Provide a clear, descriptive title</li>
            <li class="mb-2">Include steps to reproduce the issue</li>
            <li class="mb-2">Attach screenshots or error messages</li>
            <li class="mb-2">Mention any recent changes that might have caused the issue</li>
            <li class="mb-2">Select the appropriate subject and priority</li>
          </ul>
          <hr />
          <div class="small text-muted">
            <strong>Response Times:</strong>
            <ul class="mb-0 mt-2">
              <li>Urgent: Within 4 hours</li>
              <li>High: Within 8 hours</li>
              <li>Medium: Within 24 hours</li>
              <li>Low: Within 48 hours</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="card mt-3">
        <div class="card-body text-center">
          <button class="btn btn-primary btn-lg w-100" @click="submitTicket" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            <i class="fa-solid fa-paper-plane me-2" v-else></i>
            {{ saving ? 'Submitting...' : 'Submit Ticket' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
`;