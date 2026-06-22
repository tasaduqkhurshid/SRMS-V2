export default `
<div class="container-fluid p-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="mb-0">
      <i class="fa-solid fa-upload me-2"></i>Import Students
    </h2>
  </div>

  <div class="row">
    <div class="col-lg-8">
      <div class="card">
        <div class="card-header bg-light">
          <h5 class="mb-0">Upload Student Data</h5>
        </div>
        <div class="card-body">
          <div v-if="loading" class="text-center py-5">
            <span class="spinner-border"></span>
          </div>

          <div v-else>
            <div class="mb-3">
              <label class="form-label">Select Class/Course *</label>
              <select v-model="selectedCourse" class="form-select">
                <option :value="null">Select Course</option>
                <option v-for="course in courses" :key="course.id" :value="course.id">
                  {{ course.course_name }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Upload File (CSV/XLSX) *</label>
              <input 
                type="file" 
                @change="onFileChange" 
                accept=".csv,.xlsx,.xls"
                class="form-control"
              />
              <small class="text-muted">
                Supported formats: CSV, XLSX, XLS
              </small>
            </div>

            <div v-if="file" class="alert alert-success">
              <i class="fa-solid fa-check me-2"></i>File selected: <strong>{{ file.name }}</strong>
            </div>

            <div class="d-flex gap-2">
              <button 
                @click="importStudents" 
                :disabled="!file || !selectedCourse || uploading"
                class="btn btn-primary"
              >
                <i class="fa-solid fa-upload me-2"></i>
                <span v-if="uploading">Importing...</span>
                <span v-else>Import Students</span>
              </button>
              <button @click="downloadTemplate" class="btn btn-outline-secondary">
                <i class="fa-solid fa-download me-2"></i>Download Template
              </button>
            </div>

            <!-- Import Results -->
            <div v-if="importResults.success > 0 || importResults.failed > 0" class="mt-4">
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
                  <li v-for="(error, idx) in importResults.errors.slice(0, 10)" :key="idx">
                    {{ error }}
                  </li>
                  <li v-if="importResults.errors.length > 10" class="text-muted">
                    ... and {{ importResults.errors.length - 10 }} more errors
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-lg-4">
      <div class="card">
        <div class="card-header bg-light">
          <h5 class="mb-0">File Format</h5>
        </div>
        <div class="card-body">
          <p class="text-muted small">Your file should contain the following columns:</p>
          <div class="table-responsive">
            <table class="table table-sm table-bordered">
              <thead class="table-light">
                <tr>
                  <th>Column</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>name</code></td>
                  <td>John Doe</td>
                </tr>
                <tr>
                  <td><code>roll_number</code></td>
                  <td>STU001</td>
                </tr>
                <tr>
                  <td><code>father_name</code></td>
                  <td>Mr. Doe</td>
                </tr>
                <tr>
                  <td><code>mother_name</code></td>
                  <td>Mrs. Doe</td>
                </tr>
                <tr>
                  <td><code>address</code></td>
                  <td>123 Main St</td>
                </tr>
                <tr>
                  <td><code>pincode</code></td>
                  <td>110001</td>
                </tr>
                <tr>
                  <td><code>class</code></td>
                  <td>Class 10</td>
                </tr>
                <tr>
                  <td><code>section</code></td>
                  <td>A</td>
                </tr>
                <tr>
                  <td><code>gender</code></td>
                  <td>Male</td>
                </tr>
                <tr>
                  <td><code>dob</code></td>
                  <td>2008-05-15</td>
                </tr>
                <tr>
                  <td><code>admission_number</code></td>
                  <td>ADM2024001</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="alert alert-info mt-3">
            <strong>File Format:</strong> Excel/CSV file with columns:
            <br><code>name, roll_number, father_name, mother_name, address, pincode, class, section, gender, dob, admission_number</code>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`
