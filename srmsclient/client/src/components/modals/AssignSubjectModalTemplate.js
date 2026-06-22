export default `
<div v-if="open" class="position-fixed top-0 start-0 w-100 h-100" style="background: rgba(0,0,0,.35); z-index: 1050;">
  <div class="d-flex h-100 align-items-center justify-content-center">
    <div class="card shadow col-6">
      <div class="card-header d-flex justify-content-between align-items-center">
        <strong>Assign Subjects</strong>
        <button type="button" class="btn-close" @click="close"></button>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center">Loading…</div>

        <div v-else>
          <div class="mb-2">
            <label class="form-label">Add subjects</label>
            <input class="form-control" v-model="filter" placeholder="Search by id or name" @focus="openDropdown = true" @input="openDropdown = true" @keydown.down.prevent="highlightNext" @keydown.up.prevent="highlightPrev" @keydown.enter.prevent="selectHighlighted" />

            <div v-if="openDropdown && filteredSubjects.length" class="border bg-white mt-1" style="max-height:220px; overflow:auto; position:relative; z-index:1060;">
              <div v-for="(subject, idx) in filteredSubjects" :key="subject.id" class="px-2 py-1 d-flex justify-content-between align-items-center" :class="{'bg-light': idx === highlightedIndex }" style="cursor:pointer;" @mousedown.prevent="addSubject(subject.id)">
                <div class="text-muted small me-3" style="width:70px;">{{ subject.id }}</div>
                <div class="flex-grow-1">
                  <div class="fw-bold">{{ subject.subject_name }}</div>
                  <div class="small text-muted">{{ subject.subject_code }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Selected Subjects</label>
            <div class="d-flex flex-wrap">
              <div v-for="subject in selectedSubjects" :key="subject.id" class="card me-2 mb-2 col-5" >
                <div class="card-body p-2 d-flex align-items-center justify-content-between">
                  <div>
                    <div class="small text-muted">Subject ID: <strong>{{ subject.id }}</strong></div>
                    <div><strong>{{ subject.subject_name }}</strong></div>
                    <div class="small text-muted">Code:{{ subject.subject_code }}</div>
                  </div>
                  <div>
                    <button type="button" class="btn btn-sm btn-outline-danger" @click="removeSubject(subject.id)">Remove</button>
                  </div>
                </div>
              </div>

              <div v-if="!selectedSubjects.length" class="text-muted">No subjects selected</div>
            </div>
          </div>

        </div>
      </div>

      <div class="card-footer d-flex justify-content-end gap-2">
        <button class="btn btn-light" @click="close">Close</button>
        <button class="btn btn-primary" :disabled="saving" @click="save">{{ saving ? 'Saving...' : 'Save' }}</button>
      </div>
    </div>
  </div>
</div>
`;
