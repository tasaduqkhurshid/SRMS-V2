export default `
<div>
  <!-- Search -->
  <div class="d-flex gap-2 mb-2">
    <input class="form-control" style="max-width: 220px" v-model="searchTerm" placeholder="Search name / roll / admission" />
    <input class="form-control" style="max-width: 120px" v-model="classId" placeholder="Class" />
    <input class="form-control" style="max-width: 120px" v-model="section" placeholder="Section" />
    <button class="btn btn-primary" @click="getStudentList" :disabled="loading">Search</button>
  </div>

  <div class="table-responsive">
    <table class="table table-bordered table-sm align-middle">
      <thead class="table-light">
        <tr>
          <th style="width: 60px;">ID</th>
          <th>Roll</th>
          <th>Name</th>
          <th>Class</th>
          <th>Section</th>
          <th>Gender</th>
          <th>DOB</th>
          <th>Admission #</th>
          <th style="width: 160px;" class="text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in students" :key="student.id">
          <td>{{ student.id }}</td>
          <td>{{ student.roll_number }}</td>
          <td>{{ student.name }}</td>
          <td>{{ student.class }}</td>
          <td>{{ student.section }}</td>
          <td>{{ student.gender }}</td>
          <td>{{ student.dob ? student.dob.slice(0,10) : '' }}</td>
          <td>{{ student.admission_number }}</td>
          <td class="text-center">

            <div class="btn-group btn-group-sm">
              <button class="btn btn-light border" title="View Profile" @click="viewStudent(student.id)">
                <i class="fa-solid fa-user"></i>
              </button>
              <button class="btn btn-light border" title="Edit" @click="editStudent(student.id)">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-light border" title="Assign Subjects" @click="assignStudent(student.id)">
                <i class="fa-solid fa-book-open"></i>
              </button>
              <button class="btn btn-light border text-danger" title="Delete" @click="deleteStudent(student.id)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>

          </td>
        </tr>

        <tr v-if="!students.length && !loading">
          <td colspan="9" class="text-center py-4">No students found</td>
        </tr>

        <tr v-if="loading">
          <td colspan="9" class="text-center py-4">Loading…</td>
        </tr>

      </tbody>
    </table>
  </div>

  <!-- Pager -->
  <div class="d-flex justify-content-between align-items-center">
    <div>Total: {{ total }}</div>
    <div class="d-flex align-items-center gap-2">
      <button class="btn btn-sm btn-outline-secondary" :disabled="page<=1" @click="prev">Prev</button>
      <span>Page {{ page }}</span>
      <button class="btn btn-sm btn-outline-secondary" :disabled="students.length < pageSize" @click="next">Next</button>
      <select class="form-select form-select-sm" style="width: 80px" :value="pageSize" @change="changePageSize($event.target.value)">
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
      </select>
    </div>
  </div>
</div>
`;
