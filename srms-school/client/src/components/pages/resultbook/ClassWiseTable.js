export default {
  name: 'ClassWiseTable',

  props: {
    students: { type: Array, default: () => [] },
    subjectId: { type: [Number, String], default: null },
    examId: { type: [Number, String], default: null },
    subject: { type: Object, default: null },
    exam: { type: Object, default: null },
    course: { type: Object, default: null },
    academicYear: { type: Object, default: null },
    maxMarks: { type: Number, default: 100 }
  },

  template: `
  <div>

    <div v-if="!subjectId" class="text-muted">
      Select a subject to load students
    </div>

    <div v-else>

      <!-- Exam Info Card -->
      <div class="card result-entry-summary mb-3">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-6 col-md-3">
              <div class="d-flex align-items-center">
                <div class="me-3">
                  <i class="fa-solid fa-file-lines fa-lg"></i>
                </div>
                <div>
                  <div class="small text-white-50">Exam</div>
                  <div class="fw-bold">{{ exam?.exam_name || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="d-flex align-items-center">
                <div class="me-3">
                  <i class="fa-solid fa-school fa-lg"></i>
                </div>
                <div>
                  <div class="small text-white-50">Class/Course</div>
                  <div class="fw-bold">{{ course?.course_name || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="d-flex align-items-center">
                <div class="me-3">
                  <i class="fa-regular fa-calendar fa-lg"></i>
                </div>
                <div>
                  <div class="small text-white-50">Academic Year</div>
                  <div class="fw-bold">{{ academicYear?.name || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="d-flex align-items-center">
                <div class="me-3">
                  <i class="fa-solid fa-book fa-lg"></i>
                </div>
                <div>
                  <div class="small text-white-50">Subject</div>
                  <div class="fw-bold">{{ subject?.subject_name || 'N/A' }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-3 pt-3 border-top" v-if="maxMarks">
            <div class="d-flex align-items-center justify-content-center">
              <i class="fa-solid fa-star fa-lg me-2"></i>
              <span class="fw-bold">Max Marks: {{ maxMarks }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="rows.length === 0" class="text-muted">
        No students found
      </div>

      <div v-else class="table-responsive catalog-table-wrap results-table-wrap">

        <table class="table table-sm results-entry-table">

          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Theory</th>
              <th>Lab</th>
              <th>Attendance</th>
              <th>Activity</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            <tr v-for="(studentRow, index) in rows" :key="studentRow.id">

              <td>{{ index + 1 }}</td>

              <td>
                {{ studentRow.name }}
                <div class="text-muted small">
                  {{ studentRow.roll_number || '' }}
                </div>
              </td>

              <td>
                <input
                  :disabled="!hasTheory"
                  type="number"
                  v-model.number="studentRow.marks.theory"
                  @input="validateField(studentRow, 'theory')"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': hasFieldError(studentRow.id, 'theory') }"
                  min="0"
                  :max="maxMarks"
                />
                <div v-if="hasFieldError(studentRow.id, 'theory')" class="invalid-feedback d-block">
                  Enter a value from 0 to {{ maxMarks }}
                </div>
              </td>

              <td>
                <input
                  :disabled="!hasLab"
                  type="number"
                  v-model.number="studentRow.marks.lab"
                  @input="validateField(studentRow, 'lab')"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': hasFieldError(studentRow.id, 'lab') }"
                  min="0"
                  :max="maxMarks"
                />
                <div v-if="hasFieldError(studentRow.id, 'lab')" class="invalid-feedback d-block">
                  Enter a value from 0 to {{ maxMarks }}
                </div>
              </td>

              <td>
                <input
                  :disabled="!hasAttendance"
                  type="number"
                  v-model.number="studentRow.marks.attendance"
                  @input="validateField(studentRow, 'attendance')"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': hasFieldError(studentRow.id, 'attendance') }"
                  min="0"
                  :max="maxMarks"
                />
                <div v-if="hasFieldError(studentRow.id, 'attendance')" class="invalid-feedback d-block">
                  Enter a value from 0 to {{ maxMarks }}
                </div>
              </td>

              <td>
                <input
                  :disabled="!hasActivity"
                  type="number"
                  v-model.number="studentRow.marks.activity"
                  @input="validateField(studentRow, 'activity')"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': hasFieldError(studentRow.id, 'activity') }"
                  min="0"
                  :max="maxMarks"
                />
                <div v-if="hasFieldError(studentRow.id, 'activity')" class="invalid-feedback d-block">
                  Enter a value from 0 to {{ maxMarks }}
                </div>
              </td>

              <td class="align-middle" :class="{ 'text-danger fw-bold': isTotalExceeding(studentRow) }">
                {{ hasAnyMark(studentRow) ? calculateRowTotal(studentRow) : '—' }}
                <div v-if="isTotalExceeding(studentRow)" class="small text-danger">
                  Exceeds max ({{ maxMarks }})
                </div>
              </td>

              <td class="align-middle">
                <button
                  class="btn btn-sm btn-outline-primary"
                  @click="updateSingleStudent(studentRow)"
                  :disabled="hasAnyErrors(studentRow.id) || isTotalExceeding(studentRow)"
                >
                  Update
                </button>
              </td>

            </tr>

          </tbody>

        </table>

      </div>

      <div class="d-flex justify-content-end mt-2">
        <button class="btn btn-primary" @click="saveClassResults" :disabled="!examId || !subjectId || !academicYear || rows.length === 0">
          Save Class Results
        </button>
      </div>

    </div>

  </div>
  `,

  data() {
    return {
      rows: [],
      errors: {}
    }
  },

  computed: {

    hasTheory() {
      return !!(
        this.subject &&
        (this.subject.has_theory === undefined ? true : this.subject.has_theory)
      )
    },

    hasLab() {
      return !!(
        this.subject &&
        (this.subject.has_lab === undefined ? false : this.subject.has_lab)
      )
    },

    hasAttendance() {
      return !!(
        this.subject &&
        (this.subject.has_attendance === undefined ? false : this.subject.has_attendance)
      )
    },

    hasActivity() {
      return !!(
        this.subject &&
        (this.subject.has_activity === undefined ? false : this.subject.has_activity)
      )
    }

  },

  watch: {

    students: {
      immediate: true,
      handler(studentList) {

        this.errors = {}

        this.rows = (studentList || []).map(student => ({
          ...student,

          marks: {
            theory: student.marks?.theory ?? null,
            lab: student.marks?.lab ?? null,
            attendance: student.marks?.attendance ?? null,
            activity: student.marks?.activity ?? null
          }

        }))

      }
    },

    subjectId(newSubjectId) {
      if (!newSubjectId) {
        this.rows = []
      }
    }

  },

  methods: {

    validateField(studentRow, field) {
      const studentId = studentRow.id
      const value = Number(studentRow.marks[field]) || 0
      
      if (!this.errors[studentId]) {
        this.errors[studentId] = {}
      }
      
      if (value < 0 || value > this.maxMarks) {
        this.errors[studentId][field] = true
      } else {
        delete this.errors[studentId][field]
      }
      
      // Clean up empty student error objects
      if (Object.keys(this.errors[studentId] || {}).length === 0) {
        delete this.errors[studentId]
      }
    },

    hasFieldError(studentId, field) {
      return this.errors[studentId]?.[field] === true
    },

    isTotalExceeding(studentRow) {
      return this.calculateRowTotal(studentRow) > this.maxMarks
    },

    hasAnyErrors(studentId) {
      return this.errors[studentId] && Object.keys(this.errors[studentId]).length > 0
    },

    calculateRowTotal(studentRow) {

      const theoryMarks = Number(studentRow.marks.theory) || 0
      const labMarks = this.hasLab ? Number(studentRow.marks.lab) || 0 : 0
      const attendanceMarks = this.hasAttendance ? Number(studentRow.marks.attendance) || 0 : 0
      const activityMarks = this.hasActivity ? Number(studentRow.marks.activity) || 0 : 0

      return theoryMarks + labMarks + attendanceMarks + activityMarks
    },

    hasAnyMark(studentRow) {
      return ['theory', 'lab', 'attendance', 'activity'].some(field => {
        const enabled = field === 'theory' ? this.hasTheory : field === 'lab' ? this.hasLab : field === 'attendance' ? this.hasAttendance : this.hasActivity
        return enabled && studentRow.marks[field] !== null && studentRow.marks[field] !== '' && studentRow.marks[field] !== undefined
      })
    },

    optionalMark(value) {
      if (value === null || value === '' || value === undefined) return null
      const number = Number(value)
      return Number.isFinite(number) ? number : null
    },

    saveClassResults() {

      // Validate all rows first
      let hasErrors = false
      this.rows.forEach(studentRow => {
        const total = this.calculateRowTotal(studentRow)
        
        // Check each field
        ;['theory', 'lab', 'attendance', 'activity'].forEach(field => {
          const enabled = field === 'theory' ? this.hasTheory : field === 'lab' ? this.hasLab : field === 'attendance' ? this.hasAttendance : this.hasActivity
          if (enabled && studentRow.marks[field] !== null && studentRow.marks[field] !== '') {
            this.validateField(studentRow, field)
            if (this.hasFieldError(studentRow.id, field)) hasErrors = true
          }
        })
        
        // Check total
        if (total > this.maxMarks) {
          hasErrors = true
        }
      })

      if (hasErrors) {
        return this.$emit('error', `Marks cannot exceed max marks (${this.maxMarks})`)
      }

      if (!this.examId || !this.subjectId) {
        return this.$emit('error', 'Exam and subject are required')
      }

      const payloadRows = this.rows.map(studentRow => ({

        id: studentRow.result_id || null,

        student_id: studentRow.student_id,

        exam_id: this.examId,

        subject_id: this.subjectId,

        theory_marks: this.optionalMark(studentRow.marks.theory),

        lab_marks: this.optionalMark(studentRow.marks.lab),

        attendance_marks: this.optionalMark(studentRow.marks.attendance),

        activity_marks: this.optionalMark(studentRow.marks.activity),

        total_marks: this.hasAnyMark(studentRow) ? this.calculateRowTotal(studentRow) : null

      }))

      this.$emit('save', payloadRows)
    },

    updateSingleStudent(studentRow) {

      // Validate before update
      const total = this.calculateRowTotal(studentRow)
      
      // Check each field
      ;['theory', 'lab', 'attendance', 'activity'].forEach(field => {
        const enabled = field === 'theory' ? this.hasTheory : field === 'lab' ? this.hasLab : field === 'attendance' ? this.hasAttendance : this.hasActivity
        if (enabled && studentRow.marks[field] !== null && studentRow.marks[field] !== '') this.validateField(studentRow, field)
      })

      if (this.hasAnyErrors(studentRow.id)) {
        return this.$emit('error', `Marks must be between 0 and ${this.maxMarks}`)
      }
      
      // Check total
      if (total > this.maxMarks) {
        return this.$emit('error', `Total marks (${total}) cannot exceed max marks (${this.maxMarks})`)
      }

      const payload = {

        result_id: studentRow.result_id || null,

        student_id: studentRow.student_id,

        exam_id: this.examId,

        subject_id: this.subjectId,

        marks: {
          ...studentRow.marks
        },

        total: this.calculateRowTotal(studentRow)
      }

      console.debug('ClassWiseTable update payload:', payload)

      this.$emit('update', payload)
    }

  }
}
