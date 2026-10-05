export default `
<div v-if="open" class="position-fixed top-0 start-0 w-100 h-100" style="background: rgba(0,0,0,.35); z-index: 1050;">
  <div class="d-flex h-100 align-items-center justify-content-center">
    <div class="card shadow col-6">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="m-0">{{ mode === 'edit' ? 'Edit Course' : 'Add Course' }}</h5>
        <button type="button" class="btn-close" @click="close"></button>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <label class="form-label">Name</label>
          <input class="form-control" v-model="course.course_name" />
        </div>
        <div class="mb-3">
          <label class="form-label">Code</label>
          <input class="form-control" v-model="course.course_code" />
        </div>
        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea class="form-control" v-model="course.description"></textarea>
        </div>

        <div class="d-flex justify-content-end">
          <button class="btn btn-secondary me-2" @click="close">Close</button>
          <button class="btn btn-primary" @click="save">Save</button>
        </div>
      </div>
    </div>
  </div>
</div>
`