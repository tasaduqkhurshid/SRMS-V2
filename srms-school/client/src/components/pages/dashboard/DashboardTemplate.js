export default `
<div class="dashboard-page">
  <!-- Dashboard Hero -->
  <div class="dashboard-hero">
    <div class="dashboard-hero-left">
      <span class="dashboard-hero-label">Dashboard</span>
      <h1 class="dashboard-hero-title">{{ greeting }}, {{ adminName }} 👋</h1>
      <p class="dashboard-hero-subtitle">Here's what's happening with your school today.</p>
    </div>
    <div class="dashboard-hero-right">
      <div class="dashboard-hero-date d-none d-sm-flex align-items-center gap-2">
        <i class="fa-solid fa-calendar-days text-primary"></i>
        <span>{{ currentDate }}</span>
      </div>
      <router-link to="/students/import" class="dashboard-hero-btn">
        <i class="fa-solid fa-file-import me-2"></i>Import Students
      </router-link>
    </div>
  </div>

  <!-- Loading state -->
  <div v-if="loading" class="text-center py-5">
    <span class="spinner-border text-primary"></span>
  </div>

  <div v-else>
    <!-- KPI Cards -->
    <div class="row g-3 mb-4">
      <!-- Total Students -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="kpi-card">
          <div class="kpi-card-inner">
            <div class="kpi-icon-wrapper kpi-students">
              <i class="fa-solid fa-user-graduate"></i>
            </div>
            <div class="kpi-content">
              <div class="kpi-label">Total Students</div>
              <div class="kpi-value">{{ totals.students }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Subjects -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="kpi-card">
          <div class="kpi-card-inner">
            <div class="kpi-icon-wrapper kpi-subjects">
              <i class="fa-solid fa-book-open"></i>
            </div>
            <div class="kpi-content">
              <div class="kpi-label">Total Subjects</div>
              <div class="kpi-value">{{ totals.subjects }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Exams -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="kpi-card">
          <div class="kpi-card-inner">
            <div class="kpi-icon-wrapper kpi-exams">
              <i class="fa-solid fa-file-circle-check"></i>
            </div>
            <div class="kpi-content">
              <div class="kpi-label">Total Exams</div>
              <div class="kpi-value">{{ totals.exams }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Results -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="kpi-card">
          <div class="kpi-card-inner">
            <div class="kpi-icon-wrapper kpi-results">
              <i class="fa-solid fa-chart-bar"></i>
            </div>
            <div class="kpi-content">
              <div class="kpi-label">Total Results</div>
              <div class="kpi-value">{{ totals.results }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Students + Recent Exams -->
    <div class="row g-3 mb-4">
      <!-- Recent Students -->
      <div class="col-12 col-lg-7">
        <div class="card-dashboard h-100">
          <div class="card-header-dashboard d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <div class="card-header-icon card-header-icon-students">
                <i class="fa-solid fa-users"></i>
              </div>
              <h5 class="card-header-title">Recent Students</h5>
            </div>
            <router-link to="/students" class="card-header-link">
              View all <i class="fa-solid fa-arrow-right ms-1"></i>
            </router-link>
          </div>
          <div class="table-responsive">
            <table class="table table-hover mb-0 table-dashboard" v-if="recentStudents.length > 0">
              <thead>
                <tr>
                  <th>Student</th>
                  <th class="d-none d-md-table-cell">Class</th>
                  <th class="d-none d-lg-table-cell">Admission #</th>
                  <th>Roll No</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in recentStudents" :key="student._id">
                  <td>
                    <div class="d-flex align-items-center gap-3">
                      <div class="student-avatar">
                        <span>{{ getStudentInitials(student.name) }}</span>
                      </div>
                      <div class="min-width-0">
                        <div class="student-name-cell">{{ student.name }}</div>
                        <div class="student-sub-cell">{{ student.student_code || '—' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="d-none d-md-table-cell">
                    {{ student.class || '—' }}<span v-if="student.section"> · {{ student.section }}</span>
                  </td>
                  <td class="d-none d-lg-table-cell">{{ student.admission_number || '—' }}</td>
                  <td>{{ student.roll_number || '—' }}</td>
                </tr>
              </tbody>
            </table>

            <!-- Empty state -->
            <div v-else class="empty-state">
              <div class="empty-state-icon">
                <i class="fa-solid fa-user-graduate"></i>
              </div>
              <p class="empty-state-text">No students yet</p>
              <p class="empty-state-subtext">Add your first student to get started.</p>
              <router-link to="/students" class="btn btn-outline-primary btn-sm mt-2">
                <i class="fa-solid fa-user-plus me-1"></i>Add Student
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Exams -->
      <div class="col-12 col-lg-5">
        <div class="card-dashboard h-100">
          <div class="card-header-dashboard d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <div class="card-header-icon card-header-icon-exams">
                <i class="fa-solid fa-file-circle-check"></i>
              </div>
              <h5 class="card-header-title">Recent Exams</h5>
            </div>
            <router-link to="/exams" class="card-header-link">
              View all <i class="fa-solid fa-arrow-right ms-1"></i>
            </router-link>
          </div>
          <div class="table-responsive" v-if="recentExams.length > 0">
            <table class="table table-hover mb-0 table-dashboard">
              <thead>
                <tr>
                  <th>Exam</th>
                  <th class="d-none d-sm-table-cell">Max Marks</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="exam in recentExams" :key="exam._id">
                  <td>
                    <div class="student-name-cell">{{ exam.exam_name }}</div>
                  </td>
                  <td class="d-none d-sm-table-cell">{{ exam.max_marks ?? '—' }}</td>
                  <td>{{ formatDate(exam.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty state -->
          <div v-else class="empty-state">
            <div class="empty-state-icon empty-state-icon-exams">
              <i class="fa-solid fa-file-circle-check"></i>
            </div>
            <p class="empty-state-text">No exams created yet</p>
            <p class="empty-state-subtext">Create your first exam to get started.</p>
            <router-link to="/exams" class="btn btn-primary btn-sm mt-2">
              <i class="fa-solid fa-plus me-1"></i>Create Exam
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row g-3 mb-4">
      <!-- Add Student -->
      <div class="col-12 col-sm-6 col-lg-4">
        <router-link to="/students" class="action-tile">
          <div class="action-icon action-icon-students">
            <i class="fa-solid fa-user-plus"></i>
          </div>
          <div class="action-content">
            <div class="action-title">Add Student</div>
            <div class="action-desc">Register a new student</div>
          </div>
          <i class="fa-solid fa-arrow-right action-arrow"></i>
        </router-link>
      </div>

      <!-- Create Exam -->
      <div class="col-12 col-sm-6 col-lg-4">
        <router-link to="/exams" class="action-tile">
          <div class="action-icon action-icon-exams">
            <i class="fa-solid fa-file-circle-plus"></i>
          </div>
          <div class="action-content">
            <div class="action-title">Create Exam</div>
            <div class="action-desc">Create a new exam</div>
          </div>
          <i class="fa-solid fa-arrow-right action-arrow"></i>
        </router-link>
      </div>

      <!-- Enter Results -->
      <div class="col-12 col-sm-6 col-lg-4">
        <router-link to="/results/result-book/class-wise" class="action-tile">
          <div class="action-icon action-icon-results">
            <i class="fa-solid fa-pen-to-square"></i>
          </div>
          <div class="action-content">
            <div class="action-title">Enter Results</div>
            <div class="action-desc">Enter and manage results</div>
          </div>
          <i class="fa-solid fa-arrow-right action-arrow"></i>
        </router-link>
      </div>

      <!-- Manage Subjects -->
      <div class="col-12 col-sm-6 col-lg-4">
        <router-link to="/subjects" class="action-tile">
          <div class="action-icon action-icon-subjects">
            <i class="fa-solid fa-book-open"></i>
          </div>
          <div class="action-content">
            <div class="action-title">Manage Subjects</div>
            <div class="action-desc">Add or edit subjects</div>
          </div>
          <i class="fa-solid fa-arrow-right action-arrow"></i>
        </router-link>
      </div>

      <!-- Manage Courses -->
      <div class="col-12 col-sm-6 col-lg-4">
        <router-link to="/courses" class="action-tile">
          <div class="action-icon action-icon-courses">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <div class="action-content">
            <div class="action-title">Manage Courses</div>
            <div class="action-desc">Add or edit courses</div>
          </div>
          <i class="fa-solid fa-arrow-right action-arrow"></i>
        </router-link>
      </div>

      <!-- Import Students -->
      <div class="col-12 col-sm-6 col-lg-4">
        <router-link to="/students/import" class="action-tile">
          <div class="action-icon action-icon-import">
            <i class="fa-solid fa-file-import"></i>
          </div>
          <div class="action-content">
            <div class="action-title">Import Students</div>
            <div class="action-desc">Import from Excel/CSV</div>
          </div>
          <i class="fa-solid fa-arrow-right action-arrow"></i>
        </router-link>
      </div>
    </div>

    <!-- Academic Overview -->
    <div class="card-dashboard">
      <div class="card-header-dashboard">
        <div class="d-flex align-items-center gap-2">
          <div class="card-header-icon card-header-icon-overview">
            <i class="fa-solid fa-chart-pie"></i>
          </div>
          <h5 class="card-header-title">Academic Overview</h5>
        </div>
      </div>
      <div class="card-body-dashboard">
        <div class="overview-list">
          <div class="overview-item" v-for="item in overview" :key="item.key">
            <div class="overview-icon" :class="item.cls">
              <i :class="item.icon"></i>
            </div>
            <div class="overview-label">{{ item.label }}</div>
            <div class="overview-value">{{ item.value }}</div>
            <div class="overview-bar">
              <div class="overview-bar-fill" :style="{ width: item.width + '%', background: item.color }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`
