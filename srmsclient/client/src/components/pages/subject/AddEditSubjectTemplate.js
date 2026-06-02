export default `
<div v-if="open" class="position-fixed top-0 start-0 w-100 h-100" style="background: rgba(0,0,0,.35);">
  <div class="d-flex h-100 align-items-center justify-content-center">
    <div class="card shadow col-6">

      <div class="card-header d-flex justify-content-between align-items-center">
        <strong>{{ mode === 'edit' ? 'Edit Subject' : 'Add Subject' }}</strong>
        <button type="button" class="btn-close" @click="close"></button>
      </div>

      <form id="subjectForm" data-vform @validated-submit="saveSubject">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-12">
              <label class="form-label">Subject Name</label>
              <input class="form-control" v-model="subject.subject_name" data-vtype="text" />
            </div>

            <div class="col-md-6">
              <label class="form-label">Subject Code</label>
              <input class="form-control" v-model="subject.subject_code" data-vtype="text" />
            </div>

            <div class="col-md-3">
              <label class="form-label">Has Theory</label>
              <select class="form-control" v-model="subject.has_theory">
                <option :value="true">Yes</option>
                <option :value="false">No</option>
              </select>
            </div>

            <div class="col-md-3">
              <label class="form-label">Has Lab</label>
              <select class="form-control" v-model="subject.has_lab">
                <option :value="true">Yes</option>
                <option :value="false">No</option>
              </select>
            </div>

            <div class="col-md-3">
              <label class="form-label">Has Attendance</label>
              <select class="form-control" v-model="subject.has_attendance">
                <option :value="true">Yes</option>
                <option :value="false">No</option>
              </select>
            </div>
            
            <div class="col-md-3">
              <label class="form-label">Has Activity</label>
              <select class="form-control" v-model="subject.has_activity">
                <option :value="true">Yes</option>
                <option :value="false">No</option>
              </select>
            </div>

          </div>
        </div>

        <div class="card-footer d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-light" @click="close">Close</button>
          <button type="submit" class="btn btn-primary">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            {{ mode === 'edit' ? 'Update' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
`;
