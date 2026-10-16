export default `
<div class="students-page">
  <div class="students-filter-card">
    <div class="students-list-toolbar">
      <form @submit.prevent="applySearch" class="students-filter-form">
        <div class="students-search-control">
          <label class="form-label visually-hidden" for="studentSearch">Search students</label>
          <div class="input-group">
            <span class="input-group-text bg-transparent border-end-0">
              <i class="fa-solid fa-magnifying-glass text-muted"></i>
            </span>
            <input
              id="studentSearch"
              type="search"
              class="form-control border-start-0"
              v-model="searchTerm"
              placeholder="Search name, student ID, roll number..."
              @keydown.enter="applySearch"
            />
          </div>
        </div>

        <div>
          <label class="form-label visually-hidden" for="classFilter">Class</label>
          <select
            id="classFilter"
            class="form-select"
            v-model="classId"
            @change="applyFilters"
          >
            <option value="">All Classes</option>
            <option v-for="c in courses" :key="c._id" :value="c._id">
              {{ c.course_name }} ({{ c.course_code }})
            </option>
          </select>
        </div>

        <div class="students-section-control">
          <label class="form-label visually-hidden" for="sectionFilter">Section</label>
          <input
            id="sectionFilter"
            type="text"
            class="form-control"
            v-model="section"
            placeholder="Section (e.g., A, B)"
            @keydown.enter="applyFilters"
          />
        </div>

        <div class="students-search-actions">
          <button
            type="submit"
            class="btn btn-primary flex-fill"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
            <i class="fa-solid fa-magnifying-glass me-1" v-else></i>
            Search
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="clearFilters"
            :disabled="!hasActiveFilters"
            title="Clear filters"
          >
            <i class="fa-solid fa-rotate-left"></i>
          </button>
        </div>
      </form>
    </div>
  </div>

  <div class="students-table-card">
    <div v-if="loading && !students.length" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-3 mb-0">Loading students…</p>
    </div>

    <div v-else class="table-responsive">
      <table class="table table-dashboard students-table align-middle mb-0">
        <thead>
          <tr>
            <th class="students-select-column"><input class="form-check-input" type="checkbox" :checked="allStudentsSelected" @change="toggleAllStudents($event.target.checked)" aria-label="Select all students" /></th>
            <th class="students-row-number">#</th>
            <th class="student-name-heading" :aria-sort="sortKey === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"><button class="students-sort-button" @click="toggleSort('name')">Student <i :class="['fa-solid', sortIndicator('name')]"></i></button></th>
            <th style="min-width: 115px;" :aria-sort="sortKey === 'student_code' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"><button class="students-sort-button" @click="toggleSort('student_code')">Student ID <i :class="['fa-solid', sortIndicator('student_code')]"></i></button></th>
            <th style="min-width: 110px;" :aria-sort="sortKey === 'class' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"><button class="students-sort-button" @click="toggleSort('class')">Class <i :class="['fa-solid', sortIndicator('class')]"></i></button></th>
            <th style="min-width: 95px;" :aria-sort="sortKey === 'section' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"><button class="students-sort-button" @click="toggleSort('section')">Section <i :class="['fa-solid', sortIndicator('section')]"></i></button></th>
            <th style="min-width: 95px;" :aria-sort="sortKey === 'gender' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"><button class="students-sort-button" @click="toggleSort('gender')">Gender <i :class="['fa-solid', sortIndicator('gender')]"></i></button></th>
            <th style="min-width: 115px;" :aria-sort="sortKey === 'dob' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"><button class="students-sort-button" @click="toggleSort('dob')">Date of Birth <i :class="['fa-solid', sortIndicator('dob')]"></i></button></th>
            <th style="min-width: 145px;" :aria-sort="sortKey === 'admission_number' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"><button class="students-sort-button" @click="toggleSort('admission_number')">Admission Number <i :class="['fa-solid', sortIndicator('admission_number')]"></i></button></th>
            <th style="width: 160px;" class="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(student, index) in sortedStudents" :key="student._id">
            <td class="students-select-column"><input class="form-check-input" type="checkbox" v-model="selectedStudents" :value="student._id" :aria-label="'Select ' + (student.name || 'student')" /></td>
            <td class="text-muted fw-medium students-row-number">{{ (meta.page - 1) * meta.limit + index + 1 }}</td>
            <td class="students-name-cell">
              <div class="students-identity">
                <div class="student-avatar" :style="{ backgroundColor: getAvatarColor(student._id) }">{{ getInitials(student.name) }}</div>
                <div class="d-flex flex-column min-width-0">
                  <span class="student-name-cell">{{ student.name || '—' }}</span>
                  <span class="student-sub-cell">{{ student.roll_number || '—' }}</span>
                </div>
              </div>
            </td>
            <td class="font-monospace small">{{ student.student_code || '—' }}</td>
            <td><span class="students-class-badge">{{ student.class || '—' }}</span></td>
            <td><span class="students-section-badge">{{ student.section || '—' }}</span></td>

            <td>
              <span class="badge badge-gender" :class="genderBadgeClass(student.gender)">
                {{ student.gender || '—' }}
              </span>
            </td>

            <td class="text-muted">{{ student.dob ? String(student.dob).slice(0,10) : '—' }}</td>

            <td class="text-muted font-monospace small">{{ student.admission_number || '—' }}</td>

            <td class="text-end">
              <div class="btn-group btn-group-sm" role="group" aria-label="Student actions">
                <button
                  class="btn students-action-btn students-action-view"
                  title="View Profile"
                  @click="viewStudent(student._id)"
                  aria-label="View student profile"
                >
                  <i class="fa-solid fa-eye"></i>
                </button>
                <button
                  class="btn students-action-btn students-action-edit"
                  title="Edit Student"
                  @click="editStudent(student._id)"
                  aria-label="Edit student"
                >
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button
                  class="btn students-action-btn students-action-academic"
                  title="Assign Subjects"
                  @click="assignStudent(student._id)"
                  aria-label="Assign subjects"
                >
                  <i class="fa-solid fa-book-bookmark"></i>
                </button>
                <button
                  class="btn students-action-btn students-action-delete"
                  title="Delete Student"
                  @click="deleteStudent(student._id)"
                  aria-label="Delete student"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="!students.length && !loading">
            <td colspan="10" class="text-center py-4">
              <div class="empty-state">
                <div class="empty-state-icon">
                  <i class="fa-solid fa-users"></i>
                </div>
                <p class="empty-state-text" v-if="hasActiveFilters">No students match your filters</p>
                <p class="empty-state-text" v-else>No students found</p>
                <p class="empty-state-subtext" v-if="hasActiveFilters">Try adjusting your search or filters</p>
                <p class="empty-state-subtext" v-else>Get started by adding your first student</p>
                <button class="btn btn-primary mt-2" @click="handleAddStudent" v-if="!hasActiveFilters">
                  <i class="fa-solid fa-plus me-1"></i> Add Student
                </button>
                <button class="btn btn-outline-secondary mt-2" @click="clearFilters" v-if="hasActiveFilters">
                  <i class="fa-solid fa-xmark me-1"></i> Clear Filters
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="students-list-footer d-flex flex-wrap justify-content-between align-items-center gap-3">
      <div class="text-muted small">{{ showingRange }}</div>
      <nav class="d-flex align-items-center gap-2" aria-label="Pagination">
        <button
          class="btn btn-sm students-page-btn"
          :disabled="meta.page <= 1"
          @click="prev"
          aria-label="Previous page"
        >
          <i class="fa-solid fa-chevron-left me-1"></i> Previous
        </button>
        <span class="students-page-label" aria-current="page">
          Page {{ meta.page }} of {{ meta.pages }}
        </span>
        <button
          class="btn btn-sm students-page-btn"
          :disabled="meta.page >= meta.pages"
          @click="next"
          aria-label="Next page"
        >
          Next <i class="fa-solid fa-chevron-right ms-1"></i>
        </button>
        <div class="vr mx-2 d-none d-sm-block"></div>
        <select
          class="form-select form-select-sm"
          style="width: auto; min-width: 80px;"
          :value="meta.limit"
          @change="changePageSize($event.target.value)"
          aria-label="Rows per page"
        >
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </nav>
    </div>
  </div>
</div>
`;
