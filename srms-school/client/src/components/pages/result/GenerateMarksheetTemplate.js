export default `
<section class="catalog-page results-report-page marksheet-generator-page">
  <header class="catalog-page-heading marksheet-page-heading">
    <div class="marksheet-page-title">
      <span class="marksheet-page-icon"><i class="fa-solid fa-file-circle-check"></i></span>
      <div><p class="marksheet-eyebrow">RESULTS &amp; REPORTS</p><h1>Generate Marksheet</h1><p>Choose students, exams and a template to preview printable marksheets.</p></div>
    </div>
  </header>

  <section class="marksheet-config-card">
    <header class="marksheet-config-heading">
      <div><span class="marksheet-step">01</span><div><h2>Marksheet configuration</h2><p>Select who and what to include in this marksheet.</p></div></div>
      <span class="marksheet-selected-count"><i class="fa-solid fa-circle-check"></i>{{ selectedExams.length }} exam{{ selectedExams.length === 1 ? '' : 's' }} selected</span>
    </header>

    <div class="marksheet-generator-grid">
      <div class="marksheet-generator-field">
        <label for="marksheetTemplate">Template <span>*</span></label>
        <div class="marksheet-select-wrap"><i class="fa-regular fa-file-lines"></i>
          <select id="marksheetTemplate" v-model="selectedTemplate" class="form-select">
            <option :value="null">Select a marksheet template</option>
            <option v-for="template in templates" :key="template._id" :value="template._id">{{ template.name }}</option>
          </select>
        </div>
        <small>{{ templates.length ? templates.length + ' active template' + (templates.length === 1 ? '' : 's') + ' available' : 'Create and activate a template to continue.' }}</small>
      </div>

      <div class="marksheet-generator-field">
        <label for="marksheetStudent">Students <span>*</span></label>
        <div class="marksheet-select-wrap"><i class="fa-solid fa-user-graduate"></i>
          <select id="marksheetStudent" v-model="selectedStudent" class="form-select">
            <option :value="null">Select a student</option>
            <option value="__ALL__">All students ({{ visibleStudents.length }})</option>
            <option v-for="student in visibleStudents" :key="student._id" :value="student._id">{{ student.name }} · {{ student.roll_number || 'No roll number' }}</option>
          </select>
        </div>
        <small>{{ isAllStudentsSelected ? selectedStudentIds.length + ' students will be included' : 'Choose one student or generate for the full class.' }}</small>
      </div>

      <div class="marksheet-generator-field marksheet-exam-field">
        <div class="marksheet-exam-heading"><label>Exams <span>*</span></label><div><button type="button" @click="selectAllExams" :disabled="!exams.length">Select all</button><button type="button" @click="clearSelectedExams" :disabled="!selectedExams.length">Clear</button></div></div>
        <div class="marksheet-exam-list" role="group" aria-label="Select exams">
          <p v-if="!exams.length" class="marksheet-exam-empty"><i class="fa-regular fa-calendar-xmark"></i>No exams are available.</p>
          <label v-for="exam in exams" :key="exam._id" class="marksheet-exam-option" :class="{ selected: isExamSelected(exam._id) }" :for="'exam-' + exam._id">
            <input type="checkbox" :id="'exam-' + exam._id" :checked="isExamSelected(exam._id)" @change="toggleExam(exam._id)" />
            <span class="marksheet-exam-check"><i class="fa-solid fa-check"></i></span>
            <span><strong>{{ exam.exam_name || exam.name }}</strong><small>{{ exam.academic_year_id?.name || 'Exam record' }}</small></span>
          </label>
        </div>
        <small>Select one or more exams to include in the preview.</small>
      </div>

      <div class="marksheet-generator-field">
        <label for="marksheetCourse">Class / course</label>
        <div class="marksheet-select-wrap"><i class="fa-solid fa-school"></i>
          <select id="marksheetCourse" v-model="selectedCourse" class="form-select">
            <option :value="null">All classes</option>
            <option v-for="course in courses" :key="course._id" :value="course._id">{{ course.course_name || course.name }}</option>
          </select>
        </div>
        <small>Filter the student list by class.</small>
      </div>

      <div class="marksheet-generator-field">
        <label for="marksheetYear">Academic year</label>
        <div class="marksheet-select-wrap"><i class="fa-regular fa-calendar"></i>
          <select id="marksheetYear" v-model="selectedAcademicYear" class="form-select">
            <option :value="null">All academic years</option>
            <option v-for="year in academicYears" :key="year._id" :value="year._id">{{ year.name }}</option>
          </select>
        </div>
        <small>Optionally narrow students to an academic year.</small>
      </div>
    </div>

    <footer class="marksheet-config-footer">
      <p><i class="fa-solid fa-circle-info"></i> Preview first, then print or save as PDF.</p>
      <button type="button" class="catalog-editor-save marksheet-generate-button" @click="generatePreview" :disabled="!canGenerate || loading">
        <span v-if="loading" class="spinner-border spinner-border-sm"></span><i v-else class="fa-solid fa-eye"></i>
        {{ loading ? 'Generating preview…' : 'Preview Marksheet' + (selectedExams.length === 1 ? '' : 's') }}
        <span v-if="isAllStudentsSelected && !loading">· {{ selectedStudentIds.length }} students</span>
      </button>
    </footer>
  </section>

  <div v-if="showPreview" class="marksheet-preview-overlay" role="dialog" aria-modal="true" aria-labelledby="marksheetPreviewTitle">
    <section class="marksheet-preview-modal">
      <header class="marksheet-preview-header">
        <div class="marksheet-preview-title-icon"><i class="fa-solid fa-file-invoice"></i></div>
        <div><p class="marksheet-eyebrow">PREVIEW</p><h2 id="marksheetPreviewTitle">Generated marksheets</h2></div>
        <span v-if="Array.isArray(previewHTML)" class="marksheet-preview-count">{{ previewHTML.length }} student{{ previewHTML.length === 1 ? '' : 's' }}</span>
        <button type="button" class="catalog-editor-close" @click="showPreview = false" aria-label="Close preview"><i class="fa-solid fa-xmark"></i></button>
      </header>
      <div class="marksheet-preview-body">
        <div v-if="previewHTML && !Array.isArray(previewHTML)" v-html="previewHTML" class="marksheet-preview-paper"></div>
        <div v-else-if="Array.isArray(previewHTML)">
          <article v-for="(sheet, index) in previewHTML" :key="index" class="marksheet-preview-sheet">
            <div class="marksheet-preview-student"><strong>{{ sheet.studentName }}</strong><span>{{ index + 1 }} of {{ previewHTML.length }}</span></div>
            <div v-html="sheet.html" class="marksheet-preview-paper"></div>
          </article>
        </div>
        <div v-else class="marksheet-preview-empty"><span class="spinner-border"></span><p>Preparing preview…</p></div>
      </div>
      <footer class="marksheet-preview-footer">
        <button type="button" class="catalog-editor-cancel" @click="showPreview = false">Close</button>
        <button type="button" class="catalog-editor-save" @click="printMarksheet"><i class="fa-solid fa-print"></i>Print / Save PDF</button>
        <button type="button" class="marksheet-upgrade-button" @click="upgradeStudent" :disabled="saving || !selectedAcademicYear || !selectedStudent || selectedStudent === '__ALL__'"><i class="fa-solid fa-arrow-up"></i>{{ saving ? 'Upgrading…' : 'Upgrade student' }}</button>
      </footer>
    </section>
  </div>
</section>
`
