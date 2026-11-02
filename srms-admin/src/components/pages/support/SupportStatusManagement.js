import { ref, reactive, onMounted } from 'vue'

export default {
  name: 'SupportStatusManagement',
  props: {
    api: { type: Function, required: true },
    items: { type: Array, required: true },
  },
  emits: ['refresh'],
  setup(props, { emit }) {
    const loading = ref(false)
    const saving = ref(false)
    const error = ref('')
    const success = ref('')
    const items = ref([...props.items])
    const showModal = ref(false)
    const editMode = ref(false)
    const form = reactive({
      _id: '',
      name: '',
      code: '',
      description: '',
      color: '#6B7280',
      is_active: true,
      is_terminal: false,
      sort_order: 0,
    })

    const openCreateModal = () => {
      editMode.value = false
      form._id = ''
      form.name = ''
      form.code = ''
      form.description = ''
      form.color = '#6B7280'
      form.is_active = true
      form.is_terminal = false
      form.sort_order = items.value.length
      showModal.value = true
    }

    const openEditModal = (item) => {
      editMode.value = true
      form._id = item._id
      form.name = item.name
      form.code = item.code
      form.description = item.description || ''
      form.color = item.color || '#6B7280'
      form.is_active = item.is_active !== false
      form.is_terminal = item.is_terminal === true
      form.sort_order = item.sort_order || 0
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      editMode.value = false
    }

    const submitForm = async () => {
      if (!form.name.trim() || !form.code.trim()) {
        error.value = 'Name and code are required'
        return
      }

      saving.value = true
      error.value = ''
      success.value = ''

      try {
        const data = {
          name: form.name.trim(),
          code: form.code.toLowerCase().trim(),
          description: form.description.trim(),
          color: form.color,
          is_active: form.is_active,
          is_terminal: form.is_terminal,
          sort_order: form.sort_order,
        }

        let response
        if (editMode.value) {
          response = await props.api(`/support-ticket-statuses/${form._id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          })
        } else {
          response = await props.api('/support-ticket-statuses', {
            method: 'POST',
            body: JSON.stringify(data),
          })
        }

        if (response) {
          success.value = editMode.value ? 'Status updated' : 'Status created'
          closeModal()
          emit('refresh')
        } else {
          error.value = 'Failed to save status'
        }
      } catch (e) {
        error.value = e.message || 'Failed to save status'
      } finally {
        saving.value = false
      }
    }

    const toggleActive = async (item) => {
      // Don't allow deactivating system statuses
      if (item.is_system && !item.is_active) {
        alert('Cannot deactivate system status')
        return
      }
      try {
        await props.api(`/support-ticket-statuses/${item._id}`, {
          method: 'PATCH',
          body: JSON.stringify({ is_active: !item.is_active }),
        })
        item.is_active = !item.is_active
      } catch (e) {
        alert(e.message || 'Failed to update status')
      }
    }

    const isSystem = (item) => item.is_system === true

    return {
      loading,
      saving,
      error,
      success,
      items,
      showModal,
      editMode,
      form,
      openCreateModal,
      openEditModal,
      closeModal,
      submitForm,
      toggleActive,
      isSystem,
    }
  },
  template: `
    <div class="support-config-page">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-1">Support Ticket Statuses</h1>
          <p class="text-muted mb-0">Manage ticket statuses</p>
        </div>
        <button class="btn btn-primary" @click="openCreateModal">
          <i class="fa-solid fa-plus me-1"></i> Add Status
        </button>
      </div>

      <p v-if="error" class="alert alert-danger">{{ error }}</p>
      <p v-if="success" class="alert alert-success">{{ success }}</p>

      <div class="alert alert-info">
        <i class="fa-solid fa-info-circle me-2"></i>
        System statuses (Pending, Awaiting, Underwriting, Reserved) cannot be deleted. Only name, description, color, and sort order can be modified for system statuses.
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th style="width: 50px;">#</th>
                <th>Name</th>
                <th>Code</th>
                <th>Color</th>
                <th>Description</th>
                <th>Terminal</th>
                <th>System</th>
                <th>Status</th>
                <th>Sort Order</th>
                <th style="width: 120px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in items" :key="item._id">
                <td class="text-muted fw-medium">{{ index + 1 }}</td>
                <td>{{ item.name }}</td>
                <td class="fw-monospace">{{ item.code }}</td>
                <td>
                  <span class="badge d-inline-flex align-items-center" :style="{ backgroundColor: item.color }">
                    <span class="me-1" style="width: 12px; height: 12px; border-radius: 50%; background-color: {{ item.color }};"></span>
                    {{ item.color }}
                  </span>
                </td>
                <td class="text-muted">{{ item.description || '—' }}</td>
                <td>
                  <span class="badge" :class="item.is_terminal ? 'bg-success' : 'bg-secondary'">
                    {{ item.is_terminal ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="item.is_system ? 'bg-primary' : 'bg-secondary'">
                    {{ item.is_system ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="item.is_active ? 'bg-success' : 'bg-secondary'">
                    {{ item.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>{{ item.sort_order || 0 }}</td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" @click="openEditModal(item)" title="Edit">
                      <i class="fa-solid fa-pen"></i>
                    </button>
                    <button v-if="!isSystem(item)" class="btn btn-outline-secondary" @click="toggleActive(item)" :class="{ active: item.is_active }" :title="item.is_active ? 'Deactivate' : 'Activate'">
                      <i :class="item.is_active ? 'fa-solid fa-toggle-on' : 'fa-solid fa-toggle-off'"></i>
                    </button>
                    <span v-if="isSystem(item)" class="btn btn-outline-secondary disabled" title="System status">
                      <i class="fa-solid fa-shield"></i>
                    </span>
                  </div>
                </td>
              </tr>

              <tr v-if="!items.length">
                <td colspan="10" class="text-center py-4">
                  <div class="empty-state">
                    <div class="empty-state-icon"><i class="fa-solid fa-flag"></i></div>
                    <p class="empty-state-text">No statuses found</p>
                    <button class="btn btn-primary mt-2" @click="openCreateModal">
                      <i class="fa-solid fa-plus me-1"></i> Add Status
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ editMode ? 'Edit Status' : 'Create Status' }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label required">Name <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model="form.name" required />
              </div>
              <div class="mb-3">
                <label class="form-label required">Code <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model="form.code" required />
                <div class="form-text">Lowercase, letters, numbers, underscores only</div>
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" v-model="form.description" rows="3"></textarea>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Color</label>
                  <input type="color" class="form-control form-control-color" v-model="form.color" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Sort Order</label>
                  <input type="number" class="form-control" v-model.number="form.sort_order" min="0" />
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" v-model="form.is_active" id="is_active" />
                    <label class="form-check-label" for="is_active">Active</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" v-model="form.is_terminal" id="is_terminal" />
                    <label class="form-check-label" for="is_terminal">Terminal Status (Resolved/Closed)</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button class="btn btn-primary" @click="submitForm" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ editMode ? 'Update' : 'Create' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
}