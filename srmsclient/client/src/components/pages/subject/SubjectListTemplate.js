export default `
<div>
  <div class="d-flex gap-2 mb-2">
    <input class="form-control" style="max-width: 320px" v-model="searchTerm" placeholder="Search name / code" />
    <button class="btn btn-primary" @click="getSubjectList" :disabled="loading">Search</button>
  </div>

  <div class="table-responsive">
    <table class="table table-bordered table-sm align-middle">
      <thead class="table-light">
        <tr>
          <th style="width: 60px;">ID</th>
          <th>Code</th>
          <th>Name</th>
          <th>Theory</th>
          <th>Lab</th>
          <th style="width: 160px;" class="text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in subjects" :key="s.id">
          <td>{{ s.id }}</td>
          <td>{{ s.subject_code }}</td>
          <td>{{ s.subject_name }}</td>
          <td>{{ s.has_theory ? 'Yes' : 'No' }}</td>
          <td>{{ s.has_lab ? 'Yes' : 'No' }}</td>
          <td class="text-center">
            <div class="btn-group btn-group-sm">
              <button class="btn btn-light border" title="Edit" @click="editSubject(s.id)">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-light border text-danger" title="Delete" @click="deleteSubject(s.id)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>

        <tr v-if="!subjects.length && !loading">
          <td colspan="6" class="text-center py-4">No subjects found</td>
        </tr>

        <tr v-if="loading">
          <td colspan="6" class="text-center py-4">Loading…</td>
        </tr>

      </tbody>
    </table>
  </div>

  <div class="d-flex justify-content-between align-items-center">
    <div>Total: {{ total }}</div>
    <div class="d-flex align-items-center gap-2">
      <button class="btn btn-sm btn-outline-secondary" :disabled="page<=1" @click="prev">Prev</button>
      <span>Page {{ page }}</span>
      <button class="btn btn-sm btn-outline-secondary" :disabled="subjects.length < pageSize" @click="next">Next</button>
      <select class="form-select form-select-sm" style="width: 80px" :value="pageSize" @change="changePageSize($event.target.value)">
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
      </select>
    </div>
  </div>
</div>
`;
