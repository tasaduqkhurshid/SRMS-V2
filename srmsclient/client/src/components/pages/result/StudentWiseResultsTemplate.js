export default `
<div class="container-fluid p-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="mb-0">
      <i class="fa-solid fa-chart-line me-2"></i>
      Student-wise Results
    </h2>
  </div>

  <!-- Filters -->
  <div class="card mb-4">
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label">Student</label>
          <select v-model="filters.student_id" class="form-select">
            <option :value="null">All Students</option>
            <option v-for="student in students" :key="student.id" :value="student.id">
              {{ student.name }} ({{ student.roll_number }})
            </option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label">Exam</label>
          <select v-model="filters.exam_id" class="form-select">
            <option :value="null">All Exams</option>
            <option v-for="exam in exams" :key="exam.id" :value="exam.id">
              {{ exam.exam_name }}
            </option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label">Academic Year</label>
          <select v-model="filters.academic_year_id" class="form-select">
            <option :value="null">All Years</option>
            <option v-for="year in academicYears" :key="year.id" :value="year.id">
              {{ year.name }}
            </option>
          </select>
        </div>

        <div class="col-md-3 d-flex align-items-end gap-2">
          <button @click="applyFilters" class="btn btn-primary">
            <i class="fa-solid fa-search me-2"></i>Filter
          </button>
          <button @click="resetFilters" class="btn btn-secondary">
            <i class="fa-solid fa-redo me-2"></i>Reset
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Results Table -->
  <div class="card">
    <div class="card-header bg-light">
      <h5 class="mb-0">Results ({{ totalRecords }})</h5>
    </div>
    <div class="table-responsive">
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th>Student Name</th>
            <th>Roll Number</th>
            <th>Exam</th>
            <th>Subject</th>
            <th>Theory Marks</th>
            <th>Lab Marks</th>
            <th>Attendance</th>
            <th>Activity</th>
            <th>Total Marks</th>
            <th>Academic Year</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="text-center">
            <td colspan="10">
              <span class="spinner-border spinner-border-sm me-2"></span>Loading...
            </td>
          </tr>
          <tr v-else-if="results.length === 0" class="text-center">
            <td colspan="10" class="text-muted">No results found</td>
          </tr>
          <tr v-for="result in results" :key="result.id">
            <td>{{ result.Student?.name || '-' }}</td>
            <td>{{ result.Student?.roll_number || '-' }}</td>
            <td>{{ result.Exam?.name || '-' }}</td>
            <td>{{ result.Subject?.name || '-' }}</td>
            <td>{{ result.theory_marks || 0 }}</td>
            <td>{{ result.lab_marks || 0 }}</td>
            <td>{{ result.attendance_marks || 0 }}</td>
            <td>{{ result.activity_marks || 0 }}</td>
            <td><strong>{{ result.total_marks || 0 }}</strong></td>
            <td>{{ result.AcademicYear?.name || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages() > 1" class="card-footer bg-light">
      <nav aria-label="pagination">
        <ul class="pagination justify-content-center mb-0">
          <li class="page-item" :class="{ disabled: filters.page === 1 }">
            <button class="page-link" @click="goToPage(1)" :disabled="filters.page === 1">
              First
            </button>
          </li>
          <li class="page-item" :class="{ disabled: filters.page === 1 }">
            <button class="page-link" @click="goToPage(filters.page - 1)" :disabled="filters.page === 1">
              Previous
            </button>
          </li>

          <li v-for="page in 5" :key="page" :class="{ active: filters.page === page }" class="page-item" v-if="page <= totalPages()">
            <button class="page-link" @click="goToPage(page)">{{ page }}</button>
          </li>

          <li class="page-item" :class="{ disabled: filters.page === totalPages() }">
            <button class="page-link" @click="goToPage(filters.page + 1)" :disabled="filters.page === totalPages()">
              Next
            </button>
          </li>
          <li class="page-item" :class="{ disabled: filters.page === totalPages() }">
            <button class="page-link" @click="goToPage(totalPages())" :disabled="filters.page === totalPages()">
              Last
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</div>
`
