export default `
<div class="container-fluid p-22">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h3 class="mb-0">
      <i class="fa-solid fa-file-lines me-2"></i>
      {{ isEdit ? 'Edit' : 'Add' }} Marksheet Template
    </h3>
    <button @click="router.back()" class="btn btn-sm btn-secondary">
      <i class="fa-solid fa-arrow-left me-2"></i>Back
    </button>
  </div>

  <div v-if="loading" class="text-center py-5">
    <span class="spinner-border"></span>
  </div>

  <div v-else class="row g-4">
    <!-- Editor Panel -->
    <div class="col-lg-12">
      <div class="card">
        <div class="d-flex justify-content-between card-header bg-light">
          <h5 class="mb-0">Template Details</h5>
          <button 
              @click="saveTemplate" 
              :disabled="saving"
              class="btn btn-sm btn-primary"
            >
              <i class="fa-solid fa-save me-2"></i>
              <span v-if="saving">Saving...</span>
              <span v-else>Save Template</span>
            </button>
        </div>
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-4">
              <label class="form-label">Template Name *</label>
              <input class="form-control"
                v-model="form.name" 
                type="text" 
                placeholder="e.g., Professional Classic"
              />
              
            </div>
            <div class="col-2">
             <label class="form-label">Active *</label>
              <input class="form-check-input"
              v-model="form.is_active" 
              type="checkbox" 
              class="form-check-input" 
              id="isActive"
            />
            </div>
            <div class="col-4" v-if="isEdit">
              <label class="form-label">Template ID *</label>
              <input class="form-control"
                v-model="form._id"
                type="text" 
                placeholder="e.g., 12345"
              />
              
            </div>  
          </div>

          <div class="mb-3">
            <textarea v-model="form.html_content"
              id="html_editor"
              style="height: 400px; border: 1px solid #ddd; border-radius: 4px;">
            </textarea>
          </div>

        </div>
      </div>
    </div>
  </div>
</div>

`
