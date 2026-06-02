export default `
<div class="container-fluid p-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="mb-0">
      <i class="fa-solid fa-file-lines me-2"></i>
      {{ isEdit ? 'Edit' : 'Add' }} Marksheet Template
    </h2>
    <button @click="router.back()" class="btn btn-secondary">
      <i class="fa-solid fa-arrow-left me-2"></i>Back
    </button>
  </div>

  <div v-if="loading" class="text-center py-5">
    <span class="spinner-border"></span>
  </div>

  <div v-else class="row g-4">
    <!-- Editor Panel -->
    <div class="col-lg-7">
      <div class="card">
        <div class="card-header bg-light">
          <h5 class="mb-0">Template Details</h5>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label">Template Name *</label>
            <input 
              v-model="form.name" 
              type="text" 
              class="form-control" 
              placeholder="e.g., Professional Classic"
            />
          </div>

          <div class="mb-3">
            <label class="form-label">HTML Content *</label>
            <div 
              id="html_editor"
              style="height: 400px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
          </div>

          <div class="mb-3 form-check">
            <input 
              v-model="form.is_active" 
              type="checkbox" 
              class="form-check-input" 
              id="isActive"
            />
            <label class="form-check-label" for="isActive">
              Active (visible for marksheet generation)
            </label>
          </div>

          <div class="d-flex gap-2">
            <button 
              @click="saveTemplate" 
              :disabled="saving"
              class="btn btn-primary"
            >
              <i class="fa-solid fa-save me-2"></i>
              <span v-if="saving">Saving...</span>
              <span v-else>Save Template</span>
            </button>
            <button @click="insertSampleMarksheet" class="btn btn-info">
              <i class="fa-solid fa-wand-magic-sparkles me-2"></i>Load Sample
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Helpers & Preview -->
    <div class="col-lg-5">
      <!-- Placeholders Card -->
      <div class="card mb-3">
        <div class="card-header bg-light">
          <h5 class="mb-0">Available Placeholders</h5>
        </div>
        <div class="card-body" style="max-height: 300px; overflow-y: auto;">
          <div class="list-group list-group-flush">
            <button 
              v-for="ph in placeholders" 
              :key="ph.value"
              type="button"
              @click="insertPlaceholder(ph.value)"
              class="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-2"
              style="font-size: 12px;"
            >
              <span>{{ ph.text }}</span>
              <code class="bg-light p-1 rounded" style="font-size: 10px;">{{ ph.value }}</code>
            </button>
          </div>
        </div>
      </div>

      <!-- Preview Card -->
      <div class="card">
        <div class="card-header bg-light">
          <h5 class="mb-0">Sample Preview</h5>
        </div>
        <div class="card-body" style="max-height: 400px; overflow-y: auto;">
          <div style="padding: 10px; background: #f9f9f9; border: 1px solid #ddd; font-size: 11px; font-family: monospace;">
            <p>When the marksheet is generated, the placeholders will be replaced with actual data:</p>
            <ul style="font-size: 10px; margin: 0; padding-left: 20px;">
              <li><code>{{student_name}}</code> → Student's full name</li>
              <li><code>{{marks_rows}}</code> → Table rows with all subject marks</li>
              <li><code>{{overall_total}}</code> → Sum of all marks</li>
              <li><code>{{exam_name}}</code> → Name of the exam</li>
              <li><code>{{session}}</code> → Academic year name</li>
              <li><code>{{class}}</code> → Course/class name</li>
              <li><code>{{overall_grade}}</code> → Calculated grade (A, B, C, D)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`
