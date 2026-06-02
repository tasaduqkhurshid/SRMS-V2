export default `
<div class="container-fluid p-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="mb-0">
      <i class="fa-solid fa-file-export me-2"></i>
      Generate Marksheet
    </h2>
  </div>

  <!-- Selection Form -->
  <div class="card mb-4">
    <div class="card-header bg-light">
      <h5 class="mb-0">Marksheet Configuration</h5>
    </div>
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label">Template *</label>
          <select v-model="selectedTemplate" class="form-select">
            <option :value="null">Select Template</option>
            <option v-for="template in templates" :key="template.id" :value="template.id">
              {{ template.name }}
            </option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label">Student *</label>
          <select v-model="selectedStudent" class="form-select">
            <option :value="null">Select Student</option>
            <option value="__ALL__" style="font-weight: bold; background-color: #f0f0f0;">
              ✓ All Students ({{ students.length }})
            </option>
            <option value="__ALL__" disabled style="border-top: 1px solid #ddd;"></option>
            <option v-for="student in students" :key="student.id" :value="student.id">
              {{ student.name }} ({{ student.roll_number }})
            </option>
          </select>
        </div>

        <div class="col-md-6">
          <label class="form-label">Exams (Select Multiple) *</label>
          <div class="exam-checkboxes" style="border: 1px solid #ddd; padding: 10px; border-radius: 4px; max-height: 150px; overflow-y: auto; background-color: #f9f9f9;">
            <div v-if="exams.length === 0" class="text-muted small">No exams available</div>
            <div v-for="exam in exams" :key="exam.id" class="form-check">
              <input 
                type="checkbox" 
                :id="'exam-' + exam.id"
                class="form-check-input"
                :checked="isExamSelected(exam.id)"
                @change="toggleExam(exam.id)"
              />
              <label class="form-check-label" :for="'exam-' + exam.id" style="cursor: pointer; font-size: 0.9rem;">
                {{ exam.exam_name }}
              </label>
            </div>
          </div>
          <small class="text-muted d-block mt-1">
            Selected: {{ selectedExams.length }} exam{{ selectedExams.length !== 1 ? 's' : '' }}
          </small>
        </div>

        <div class="col-md-3">
          <label class="form-label">Course</label>
          <select v-model="selectedCourse" class="form-select">
            <option :value="null">Select Course</option>
            <option v-for="course in courses" :key="course.id" :value="course.id">
              {{ course.course_name }}
            </option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label">Academic Year</label>
          <select v-model="selectedAcademicYear" class="form-select">
            <option :value="null">Select Year</option>
            <option v-for="year in academicYears" :key="year.id" :value="year.id">
              {{ year.name }}
            </option>
          </select>
        </div>

        <div class="col-md-9 d-flex align-items-end">
          <button 
            @click="generatePreview" 
            :disabled="!canGenerate || loading"
            class="btn btn-primary me-2"
          >
            <i class="fa-solid fa-eye me-2"></i>
            <span v-if="loading">
              <span class="spinner-border spinner-border-sm me-2"></span>Generating...
            </span>
            <span v-else>
              Preview Marksheet{{ selectedExams.length > 1 ? 's' : '' }}
              <span v-if="isAllStudentsSelected"> for All Students</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Preview Modal -->
  <div v-if="showPreview" class="modal-backdrop fade show" style="display: block;"></div>
  <div v-if="showPreview" class="modal fade show d-block" style="display: block !important; position: fixed; top: 0; left: 0; z-index: 1050;">
    <div class="modal-dialog modal-xl" style="margin: 1.75rem auto; width: 90%; max-width: 80vw;">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            Marksheet Preview
            <span v-if="Array.isArray(previewHTML)" class="badge bg-info ms-2">
              {{ previewHTML.length }} marksheet(s)
            </span>
          </h5>
          <button type="button" class="btn-close" @click="showPreview = false"></button>
        </div>
        <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
          <!-- Single marksheet -->
          <div v-if="previewHTML && !Array.isArray(previewHTML)" v-html="previewHTML" style="padding: 20px; background: white; border: 1px solid #ddd;"></div>
          
          <!-- Multiple marksheets -->
          <div v-else-if="Array.isArray(previewHTML)">
            <div v-for="(sheet, index) in previewHTML" :key="index" style="margin-bottom: 30px; page-break-after: always;">
              <div style="padding: 10px; background: #f8f9fa; border-bottom: 2px solid #dee2e6; margin-bottom: 10px;">
                <strong>{{ sheet.studentName }}</strong> ({{ index + 1 }} of {{ previewHTML.length }})
              </div>
              <div v-html="sheet.html" style="padding: 20px; background: white; border: 1px solid #ddd;"></div>
            </div>
          </div>
          
          <div v-else class="text-center text-muted">
            <p>Loading preview...</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showPreview = false">Close</button>
          <button 
            type="button" 
            class="btn btn-success"
            @click="issueMarksheet"
            :disabled="saving"
          >
            <i class="fa-solid fa-check me-2"></i>
            <span v-if="saving">Issuing...</span>
            <span v-else>Issue Marksheet</span>
          </button>
          <button 
            type="button" 
            class="btn btn-info"
            @click="upgradeStudent"
            :disabled="saving || !selectedAcademicYear"
          >
            <i class="fa-solid fa-arrow-up me-2"></i>
            <span v-if="saving">Upgrading...</span>
            <span v-else>Upgrade to Next Year</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
`
