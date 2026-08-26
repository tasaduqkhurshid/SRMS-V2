export default `
<div class="container-fluid p-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="mb-0">
      <i class="fa-solid fa-file-lines me-2"></i>
      Marksheet Templates
    </h2>
    <button @click="addTemplate" class="btn btn-primary">
      <i class="fa-solid fa-plus me-2"></i>Add Template
    </button>
  </div>

  <!-- Search -->
  <div class="card mb-4">
    <div class="card-body">
      <div class="row g-2">
        <div class="col-md-6">
          <input 
            v-model="search" 
            type="text" 
            class="form-control" 
            placeholder="Search templates..."
            @keyup.enter="searchTemplates"
          />
        </div>
        <div class="col-md-6">
          <button @click="searchTemplates" class="btn btn-primary me-2">
            <i class="fa-solid fa-search me-2"></i>Search
          </button>
          <button @click="resetSearch" class="btn btn-secondary">
            <i class="fa-solid fa-redo me-2"></i>Reset
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Templates Table -->
  <div class="card">
    <div class="card-header bg-light">
      <h5 class="mb-0">Templates ({{ totalRecords }})</h5>
    </div>
    <div class="table-responsive">
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>Template Name</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="text-center">
            <td colspan="5">
              <span class="spinner-border spinner-border-sm me-2"></span>Loading...
            </td>
          </tr>
          <tr v-else-if="templates.length === 0" class="text-center">
            <td colspan="5" class="text-muted">No templates found</td>
          </tr>
          <tr v-for="(tmpl, index) in templates" :key="tmpl._id">
            <td>{{ index + 1 }}</td>
            <td>{{ tmpl.name }}</td>
            <td>
              <span v-if="tmpl.is_active" class="badge bg-success">Active</span>
              <span v-else class="badge bg-secondary">Inactive</span>
            </td>
            <td>{{ new Date(tmpl.created_at).toLocaleDateString() }}</td>
            <td>
              <div class="btn-group btn-group-sm" role="group">
                <button 
                  @click="editTemplate(tmpl._id)" 
                  class="btn btn-outline-primary"
                  title="Edit"
                >
                  <i class="fa-solid fa-edit"></i>
                </button>
                <button 
                  @click="toggleActive(tmpl)" 
                  :class="['btn', tmpl.is_active ? 'btn-outline-warning' : 'btn-outline-success']"
                  :title="tmpl.is_active ? 'Deactivate' : 'Activate'"
                >
                  <i :class="tmpl.is_active ? 'fa-solid fa-times' : 'fa-solid fa-check'"></i>
                </button>
                <button 
                  @click="deleteTemplate(tmpl._id)" 
                  class="btn btn-outline-danger"
                  title="Delete"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages() > 1" class="card-footer bg-light">
      <nav aria-label="pagination">
        <ul class="pagination justify-content-center mb-0">
          <li class="page-item" :class="{ disabled: page === 1 }">
            <button class="page-link" @click="goToPage(1)" :disabled="page === 1">First</button>
          </li>
          <li class="page-item" :class="{ disabled: page === 1 }">
            <button class="page-link" @click="goToPage(page - 1)" :disabled="page === 1">Previous</button>
          </li>

          <li v-for="p in 5" :key="p" :class="{ active: page === p }" class="page-item" v-if="p <= totalPages()">
            <button class="page-link" @click="goToPage(p)">{{ p }}</button>
          </li>

          <li class="page-item" :class="{ disabled: page === totalPages() }">
            <button class="page-link" @click="goToPage(page + 1)" :disabled="page === totalPages()">Next</button>
          </li>
          <li class="page-item" :class="{ disabled: page === totalPages() }">
            <button class="page-link" @click="goToPage(totalPages())" :disabled="page === totalPages()">Last</button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</div>
`
