export default `
<div class="container-fluid p-4">

  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="mb-0">
      <i class="fa-solid fa-book me-2"></i>Result Book
    </h2>
  </div>

  <div v-if="loading" class="text-center py-5">
    <span class="spinner-border"></span>
  </div>

  <div v-else>

    <!-- Selection Card -->
    <div class="card mb-4">
      <div class="card-header bg-light">
        <h5 class="mb-0">Select Exam & Class</h5>
      </div>

      <div class="card-body">

        <div class="row g-3">

          <div class="col-md-3">
            <label class="form-label">Academic Year</label>
            <select v-model="selectedAcademicYear" class="form-select">
              <option :value="null">Select Year</option>
              <option v-for="year in academicYears" :key="year._id" :value="year._id">
                {{ year.name }}
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Exam *</label>
            <select v-model="selectedExam" class="form-select">
              <option :value="null">Select Exam</option>
              <option v-for="exam in exams" :key="exam._id" :value="exam._id">
                {{ exam.exam_name || exam.name }}
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Class/Course *</label>
            <select v-model="selectedCourse" @change="fetchStudentsByClass" class="form-select">
              <option :value="null">Select Class</option>
              <option v-for="course in courses" :key="course._id" :value="course._id">
                {{ course.course_name || course.name }}
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Mode</label>
            <select v-model="importMode" class="form-select">
              <option value="manual">Manual Entry</option>
              <option value="file">Import from File</option>
            </select>
          </div>

        </div>

      </div>
    </div>

    <!-- MANUAL ENTRY MODE -->
    <div v-if="importMode === 'manual'" class="row g-4">

      <div v-if="viewMode === 'class'" class="col-12">

        <div class="card mb-4">

          <div class="card-header bg-light">
            <h5 class="mb-0">Class-wise Entry</h5>
          </div>

          <div class="card-body">

            <div class="row mb-3">

              <div class="col-md-6">
                <label class="form-label">Subject</label>
                <select v-model="selectedSubjectForClass" @change="loadStudentsForSubject" class="form-select">
                  <option :value="null">Select Subject</option>
                  <option v-for="s in subjectsForCourse" :key="s._id" :value="s._id">
                    {{ s.subject_name || s.name }}
                  </option>
                </select>
              </div>

            </div>

            <ClassWiseTable
              v-if="selectedSubjectForClass"
              :students="studentsForSubject"
              :subject-id="selectedSubjectForClass"
              :exam-id="selectedExam"
              :subject="selectedSubjectObj"
              :exam="selectedExamObj"
              :course="selectedCourseObj"
              :academic-year="selectedAcademicYearObj"
              :max-marks="selectedMaxMarks"
              @save="handleClasswiseSave"
              @update="handleRowUpdate"
              @error="notifyOrAlert"
            />

          </div>

        </div>

      </div>

    </div>

    <!-- FILE IMPORT MODE -->
    <div v-if="importMode === 'file'" class="card">

      <div class="card-header bg-light">
        <h5 class="mb-0">
          <i class="fa-solid fa-file-upload me-2"></i>Import Results from File
        </h5>
      </div>

      <div class="card-body">

        <div class="row mb-3">

          <div class="col-md-5">

            <label class="form-label">Subject (or select All)</label>

            <select v-model="selectedSubjectForClass" class="form-select">
              <option :value="null">Select Subject</option>
              <option value="__ALL__">All Subjects</option>
              <option v-for="s in subjectsForCourse" :key="s._id" :value="s._id">
                {{ s.subject_name || s.name }}
              </option>
            </select>

          </div>

          <div class="col-md-7">

            <label class="form-label">&nbsp;</label>

            <button
              @click="downloadResultsTemplate"
              :disabled="!selectedExam || !selectedCourse || !selectedSubjectForClass"
              class="btn btn-outline-secondary w-100"
            >
              <i class="fa-solid fa-download me-2"></i>Download Template
            </button>

          </div>

        </div>

        <div class="alert alert-info">
          <strong>File Format:</strong> Excel file with Student ID, Student Name and marks columns.
          <br>
          <strong>Tip:</strong> Download the template above to see the correct format.
        </div>

        <div class="mb-3">

          <label class="form-label">Upload File *</label>

          <input
            type="file"
            @change="onFileChange"
            accept=".xlsx,.xls,.csv"
            class="form-control"
          />

          <small class="text-muted">Supported formats: XLSX, XLS, CSV</small>

        </div>

        <div v-if="file" class="alert alert-success">
          <i class="fa-solid fa-check me-2"></i>File selected: {{ file.name }}
        </div>

        <button
          @click="importResultsFromFile"
          :disabled="!file || !selectedExam || !selectedCourse || uploading"
          class="btn btn-primary"
        >
          <i class="fa-solid fa-upload me-2"></i>
          <span v-if="uploading">Importing...</span>
          <span v-else>Import Results</span>
        </button>

      </div>

    </div>

  </div>

</div>
`