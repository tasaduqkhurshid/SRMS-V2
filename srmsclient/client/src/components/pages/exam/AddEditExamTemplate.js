export default `<div class="position-fixed top-0 start-0 w-100 h-100" style="background: rgba(0,0,0,.35); z-index: 1050;">
  <div class="d-flex h-100 align-items-center justify-content-center">
    <div class="card shadow col-6">

      <div class="card-header d-flex justify-content-between align-items-center">
        <h5>{{ mode === 'edit' ? 'Edit Exam' : 'Add Exam' }}</h5>
        <button class="btn-close" @click="close"></button>
      </div>

      <div v-if="loading" class="py-3">Loading...</div>
      <div v-else>
        <div class="card-body mb-2">
          <label class="form-label">Name</label>
          <input v-model="exam.exam_name" class="form-control" />
        </div>
        <div class="card-body mb-2">
          <label class="form-label">Max Marks</label>
          <input type="number" v-model.number="exam.max_marks" class="form-control" />
        </div>
        <div class="card-body mb-2">
          <label class="form-label">Academic Year</label>
          <select v-model="exam.academic_year_id" class="form-select">
            <option :value="null">-- choose --</option>
            <option v-for="y in years" :value="y.id" :key="y.id">{{ y.name }}</option>
          </select>
        </div>

        <div class="d-flex justify-content-end m-3">
          <button class="btn btn-secondary me-2" @click="close">Cancel</button>
          <button class="btn btn-primary" :disabled="saving" @click="save">Save</button>
        </div>
      </div>
    </div>
  </div>
</div>
</div>`;
