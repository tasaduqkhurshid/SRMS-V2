export default `
<section class="catalog-page results-report-page marksheet-generator-page">
  <header class="catalog-page-heading"><div><h1>Generate Marksheet</h1><p>Preview student marksheets using an active template</p></div></header>

  <!-- Selection Form -->
  <div class="card catalog-card mb-4">
    <div class="card-header bg-light">
      <h5 class="mb-0">Marksheet Configuration</h5>
    </div>
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label">Template *</label>
          <select v-model="selectedTemplate" class="form-select">
            <option :value="null">Select Template</option>
            <option v-for="template in templates" :key="template._id" :value="template._id">
              {{ template.name }}
            </option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label">Student *</label>
          <select v-model="selectedStudent" class="form-select">
            <option :value="null">Select Student</option>
            <option value="__ALL__" style="font-weight: bold; background-color: #f0f0f0;">
              ✓ All Students ({{ visibleStudents.length }})
            </option>
            <option value="__ALL__" disabled style="border-top: 1px solid #ddd;"></option>
            <option v-for="student in visibleStudents" :key="student._id" :value="student._id">
              {{ student.name }} ({{ student.roll_number }})
            </option>
          </select>
        </div>

        <div class="col-md-6">
          <label class="form-label">Exams (Select Multiple) *</label>
          <div class="exam-checkboxes" style="border: 1px solid #ddd; padding: 10px; border-radius: 4px; max-height: 150px; overflow-y: auto; background-color: #f9f9f9;">
            <div v-if="exams.length === 0" class="text-muted small">No exams available</div>
            <div v-for="exam in exams" :key="exam._id" class="form-check">
              <input 
                type="checkbox" 
                :id="'exam-' + exam._id"
                class="form-check-input"
                :checked="isExamSelected(exam._id)"
                @change="toggleExam(exam._id)"
              />
              <label class="form-check-label" :for="'exam-' + exam._id" style="cursor: pointer; font-size: 0.9rem;">
                {{ exam.exam_name || exam.name }}
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
            <option v-for="course in courses" :key="course._id" :value="course._id">
              {{ course.course_name || course.name }}
            </option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label">Academic Year</label>
          <select v-model="selectedAcademicYear" class="form-select">
            <option :value="null">Select Year</option>
            <option v-for="year in academicYears" :key="year._id" :value="year._id">
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
  <div v-if="showPreview" class="marksheet-preview-overlay" role="dialog" aria-modal="true" aria-labelledby="marksheetPreviewTitle">
    <section class="marksheet-preview-modal">
        <header class="marksheet-preview-header">
          <h2 id="marksheetPreviewTitle">Marksheet Preview
            <span v-if="Array.isArray(previewHTML)" class="badge bg-info ms-2">
              {{ previewHTML.length }} marksheet(s)
            </span>
          </h2>
          <button type="button" class="catalog-editor-close" @click="showPreview = false" aria-label="Close preview"><i class="fa-solid fa-xmark"></i></button>
        </header>
        <div class="marksheet-preview-body">
          <!-- Single marksheet -->
          <div v-if="previewHTML && !Array.isArray(previewHTML)" v-html="previewHTML" class="marksheet-preview-paper"></div>
          
          <!-- Multiple marksheets -->
          <div v-else-if="Array.isArray(previewHTML)">
            <div v-for="(sheet, index) in previewHTML" :key="index" class="marksheet-preview-sheet">
              <div class="marksheet-preview-student">
                <strong>{{ sheet.studentName }}</strong> ({{ index + 1 }} of {{ previewHTML.length }})
              </div>
              <div v-html="sheet.html" class="marksheet-preview-paper"></div>
            </div>
          </div>
          
          <div v-else class="text-center text-muted">
            <p>Loading preview...</p>
          </div>
        </div>
        <footer class="marksheet-preview-footer">
          <button type="button" class="catalog-editor-cancel" @click="showPreview = false">Close</button>
          <button type="button" class="catalog-editor-save" @click="printMarksheet"><i class="fa-solid fa-print me-2"></i>Print / Save PDF</button>
          <button 
            type="button" 
            class="btn btn-info"
            @click="upgradeStudent"
            :disabled="saving || !selectedAcademicYear || !selectedStudent || selectedStudent === '__ALL__'"
          >
            <i class="fa-solid fa-arrow-up me-2"></i>
            <span v-if="saving">Upgrading...</span>
            <span v-else>Upgrade to Next Year</span>
          </button>
        </footer>
    </section>
  </div>
</section>
`
