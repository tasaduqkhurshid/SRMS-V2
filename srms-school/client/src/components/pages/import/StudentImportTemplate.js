export default `
<section class="student-import-page">
  <header class="student-import-heading">
    <div class="student-import-title-icon"><i class="fa-solid fa-upload"></i></div>
    <div>
      <h1>Import Students</h1>
      <p>Import multiple student records from a CSV or Excel file</p>
    </div>
  </header>

  <div class="row g-3 align-items-stretch">
    <div class="col-12 col-lg-7">
      <section class="student-import-card student-import-upload-card">
        <div class="student-import-card-heading">
          <span class="student-import-step student-import-step-primary">1</span>
          <div>
            <h2>Upload Student Data</h2>
            <p>Select class or course and upload your student file</p>
          </div>
        </div>

        <div v-if="loading" class="text-center py-5">
          <span class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading courses...</span></span>
        </div>

        <div v-else>
          <div class="student-import-field">
            <label class="form-label" for="studentImportCourse">Select Class/Course <span>*</span></label>
            <select id="studentImportCourse" v-model="selectedCourse" class="form-select">
              <option :value="null">Select Course</option>
              <option v-for="course in courses" :key="course._id" :value="course._id">
                {{ course.course_name || course.name }}
              </option>
            </select>
          </div>

          <div class="student-import-field student-import-file-field">
            <label class="form-label">Upload File (CSV/XLSX) <span>*</span></label>
            <label class="student-import-dropzone" @dragover.prevent @drop.prevent="onFileDrop">
              <input type="file" @change="onFileChange" accept=".csv,.xlsx,.xls" class="visually-hidden" />
              <i class="fa-solid fa-cloud-arrow-up student-import-cloud-icon"></i>
              <strong>Drag and drop your file here</strong>
              <span>or click to browse</span>
              <span class="student-import-choose-file"><i class="fa-regular fa-file me-2"></i>Choose File</span>
              <small>Supported formats: CSV, XLSX, XLS</small>
            </label>
          </div>

          <div v-if="file" class="student-import-selected-file">
            <i class="fa-solid fa-circle-check"></i>
            <span>File selected: <strong>{{ file.name }}</strong></span>
          </div>

          <div class="student-import-actions">
            <button
              @click="importStudents"
              :disabled="!file || !selectedCourse || uploading"
              class="btn student-import-submit"
            >
              <i class="fa-solid fa-upload me-2"></i>
              <span v-if="uploading">Importing...</span>
              <span v-else>Import Students</span>
            </button>
            <button @click="downloadTemplate" class="btn student-import-download">
              <i class="fa-solid fa-download me-2"></i>Download Template
            </button>
          </div>

          <div v-if="importResults.success > 0 || importResults.failed > 0" class="student-import-results">
            <div class="alert alert-info">
              <h6>Import Summary</h6>
              <p class="mb-0">
                <span class="badge bg-success me-2">Success: {{ importResults.success }}</span>
                <span class="badge bg-danger">Failed: {{ importResults.failed }}</span>
              </p>
            </div>

            <div v-if="importResults.errors.length > 0" class="alert alert-warning">
              <h6>Errors</h6>
              <ul class="mb-0">
                <li v-for="(error, idx) in importResults.errors.slice(0, 10)" :key="idx">{{ error }}</li>
                <li v-if="importResults.errors.length > 10" class="text-muted">... and {{ importResults.errors.length - 10 }} more errors</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="col-12 col-lg-5">
      <section class="student-import-card student-import-format-card">
        <div class="student-import-card-heading">
          <span class="student-import-step student-import-step-success">2</span>
          <div>
            <h2>File Format</h2>
            <p>Your file should contain the following columns</p>
          </div>
        </div>

        <div class="table-responsive student-import-format-table-wrap">
          <table class="table student-import-format-table mb-0">
            <thead><tr><th>Column</th><th>Example</th></tr></thead>
            <tbody>
              <tr><td><code>name</code></td><td>John Doe</td></tr>
              <tr><td><code>roll_number</code></td><td>STU001</td></tr>
              <tr><td><code>father_name</code></td><td>Mr. Doe</td></tr>
              <tr><td><code>mother_name</code></td><td>Mrs. Doe</td></tr>
              <tr><td><code>address</code></td><td>123 Main St</td></tr>
              <tr><td><code>pincode</code></td><td>110001</td></tr>
              <tr><td><code>class</code></td><td>Class 10</td></tr>
              <tr><td><code>section</code></td><td>A</td></tr>
              <tr><td><code>gender</code></td><td>Male</td></tr>
              <tr><td><code>dob</code></td><td>2008-05-15</td></tr>
              <tr><td><code>admission_number</code></td><td>ADM2024001</td></tr>
            </tbody>
          </table>
        </div>

        <div class="student-import-format-note">
          <i class="fa-solid fa-circle-info"></i>
          <div>
            <strong>File Format:</strong> Excel/CSV file with columns:
            <code>name, roll_number, father_name, mother_name, address, pincode, class, section, gender, dob, admission_number</code>
          </div>
        </div>
      </section>
    </div>
  </div>
</section>
`
