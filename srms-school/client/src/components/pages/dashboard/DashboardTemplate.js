export default `
<div class="dashboard-page">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="mb-0">
      <i class="fa-solid fa-chart-line me-2"></i>Dashboard
    </h2>
    <router-link to="/students/import" class="btn btn-primary">
      <i class="fa-solid fa-file-import me-2"></i>Import Students
    </router-link>
  </div>

  <div v-if="loading" class="text-center py-5">
    <span class="spinner-border"></span>
  </div>

  <div v-else>
    <!-- stat cards -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-sm-6 col-md-3">
        <div class="p-4 rounded-3 text-white" style="background:#6ea8fe;">
          <div class="fs-2 fw-bold">{{ totals.students }}</div>
          <div class="small">Total Students</div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <div class="p-4 rounded-3 text-white" style="background:#66cc99;">
          <div class="fs-2 fw-bold">{{ totals.subjects }}</div>
          <div class="small">Total Subjects</div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <div class="p-4 rounded-3 text-white" style="background:#f6c85f;">
          <div class="fs-2 fw-bold">{{ totals.exams }}</div>
          <div class="small">Total Exams</div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <div class="p-4 rounded-3 text-white" style="background:#f28b82;">
          <div class="fs-2 fw-bold">{{ totals.results }}</div>
          <div class="small">Total Results</div>
        </div>
      </div>
    </div>

    <!-- two-column area -->
    <div class="row g-3">
      <!-- Recent Students -->
      <div class="col-12 col-lg-6">
        <div class="card h-100">
          <div class="card-header bg-light">
            <h5 class="mb-0">
              <i class="fa-solid fa-users me-2"></i>Recent Students
            </h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table mb-0 table-sm">
                <thead class="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Roll No</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="student in recentStudents" :key="student.id">
                    <td>{{ student.name }}</td>
                    <td>{{ student.roll_number }}</td>
                    <td>
                      <span class="badge bg-success">Active</span>
                    </td>
                  </tr>
                  <tr v-if="recentStudents.length === 0">
                    <td colspan="3" class="text-center text-muted py-3">No students yet</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- recent exams -->
      <div class="col-12 col-lg-6">
        <div class="card h-100">
          <div class="card-header bg-light">
            <h5 class="mb-0">
              <i class="fa-solid fa-file-text me-2"></i>Recent Exams
            </h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table mb-0 table-sm">
                <thead class="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="exam in recentExams" :key="exam.id">
                    <td>{{ exam.name }}</td>
                    <td><code>{{ exam.code }}</code></td>
                  </tr>
                  <tr v-if="recentExams.length === 0">
                    <td colspan="2" class="text-center text-muted py-3">No exams yet</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`
