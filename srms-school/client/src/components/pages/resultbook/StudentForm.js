export default {
  name: 'StudentForm',
  props: {
    students: { type: Array, default: () => [] },
    subjects: { type: Array, default: () => [] },
    resultForm: { type: Object, default: () => ({}) },
    selectedExam: { type: [Number, String], default: null },
    selectedCourse: { type: [Number, String], default: null }
  },
  template: `
    <div class="card mb-4">
      <div class="card-header bg-light">
        <h5 class="mb-0"><i class="fa-solid fa-edit me-2"></i>Add / Edit Student Result</h5>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Student *</label>
            <select v-model="resultForm.student_id" @change="onSelectionChange" class="form-select">
              <option :value="null">Select Student</option>
              <option v-for="student in students" :key="student._id" :value="student._id">
                {{ student.name }} ({{ student.roll_number }})
              </option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label">Subject *</label>
            <select v-model="resultForm.subject_id" @change="onSelectionChange" class="form-select">
              <option :value="null">Select Subject</option>
              <option v-for="subject in subjects" :key="subject._id" :value="subject._id">
                {{ subject.subject_name || subject.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="row g-3 mt-3">
          <div class="col-md-3">
            <label class="form-label">Theory Marks</label>
            <input v-model.number="resultForm.theory_marks" type="number" class="form-control" min="0" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Lab Marks</label>
            <input v-model.number="resultForm.lab_marks" type="number" class="form-control" min="0" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Attendance</label>
            <input v-model.number="resultForm.attendance_marks" type="number" class="form-control" min="0" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Activity</label>
            <input v-model.number="resultForm.activity_marks" type="number" class="form-control" min="0" />
          </div>
        </div>

        <div class="mt-4 d-flex justify-content-end">
          <button @click="onSave" class="btn btn-primary px-4" :disabled="!selectedExam || !selectedCourse">Save Result</button>
        </div>
      </div>
    </div>
  `,
  methods: {
    onSelectionChange() {
      this.$emit('load-existing')
    },
    onSave() {
      this.$emit('save')
    }
  }
}
