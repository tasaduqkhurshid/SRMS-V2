export default `
<div v-if="open" class="position-fixed top-0 start-0 w-100 h-100" style="background: rgba(0,0,0,.35);">
  <div class="d-flex h-100 align-items-center justify-content-center">
    <div class="card shadow col-8">

      <div class="card-header d-flex justify-content-between align-items-center">
        <strong>{{ mode === 'edit' ? 'Edit Student' : 'Add Student' }}</strong>
        <button type="button" class="btn-close" @click="close"></button>
      </div>

      <form id="studentForm" data-vform @validated-submit="saveStudentDetails">

        <div class="card-body">
          <div class="row g-3">

            <!-- LEFT: PHOTO -->
            <div class="col-md-4">
              <div class="card h-100">
                <div class="card-body d-flex flex-column align-items-center justify-content-center">

                  <!-- Student Photo -->
                  <div class="ratio ratio-1x1" style="width:100%; max-width:220px;">
                    <img
                      :src="previewUrl || student.image || placeholderImg"
                      class="img-fluid rounded border"
                      style="object-fit: cover;"
                    />
                  </div>

                  <!-- File Input -->
                  <div class="mt-3 w-100">
                    <input
                      ref="fileInputRef"
                      class="form-control"
                      type="file"
                      accept="image/*"
                      @change="onFileChange"
                      />
                  </div>

                  <!-- Clear Button -->
                  <div class="d-flex gap-2 mt-2">
                    <button
                      class="btn btn-sm btn-outline-secondary"
                      type="button"
                      @click="clearFile"
                      :disabled="!hasFile"
                    >
                      Remove Photo
                    </button>
                  </div>

                </div>
              </div>
            </div>

            <!-- RIGHT: FORM -->
            <div class="col-md-8">
              <div class="row g-2">

                <div class="col-md-4">
                  <label class="form-label">Roll No</label>
                  <input class="form-control" v-model="student.roll_number" data-vtype="number" />
                  </div>

                <div class="col-md-8">
                  <label class="form-label">Name</label>
                  <input class="form-control" v-model="student.name" data-vtype="text" data-vmin="2" />
                  </div>

                <div class="col-md-6">
                  <label class="form-label">Father's Name</label>
                  <input class="form-control" v-model="student.father_name" data-vtype="text" />
                  </div>

                <div class="col-md-6">
                  <label class="form-label">Mother's Name</label>
                  <input class="form-control" v-model="student.mother_name" data-vtype="text" />
                </div>

                <div class="col-md-8">
                  <label class="form-label">Address</label>
                  <textarea class="form-control" rows="1" v-model="student.address" data-vtype="text"></textarea>
                </div>

                <div class="col-md-4">
                  <label class="form-label">Pincode</label>
                  <input class="form-control" v-model="student.pincode" data-vtype="number" />
                </div>

                <div class="col-md-4">
                  <label class="form-label">Class</label>
                  <select class="form-control" v-model="student.class" data-vtype="select">
                    <option value="">Select course</option>
                    <option v-for="c in courses" :key="c._id" :value="c._id">{{ c.course_name }} ({{ c.course_code }})</option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label">Section</label>
                  <input class="form-control" v-model="student.section" data-vtype="text" />
                </div>

                <div class="col-md-4">
                  <label class="form-label">Gender</label>
                  <select class="form-control" v-model="student.gender" data-vtype="select">
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label">DOB</label>
                  <input type="date" class="form-control" v-model="student.dob" data-vtype="date" />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Admission No</label>
                  <input class="form-control" v-model="student.admission_number" data-vtype="text" />
                </div>

                <div class="col-md-12">
                  <label class="form-label">{{ mode === 'edit' ? 'Reset Student Portal Password (optional)' : 'Student Portal Password' }}</label>
                  <input class="form-control" v-model="studentPortalPassword" type="password" minlength="8" autocomplete="new-password" :required="mode === 'create'" placeholder="At least 8 characters" />
                  <small class="text-muted">Students sign in with their admission number or roll number and this password.</small>
                </div>

                <div class="col-md-6">
                  <label class="form-label">
                    {{ mode === 'edit' ? 'Academic Year (Upgrade)' : 'Academic Year' }}
                  </label>
                  <select 
                    v-model="student.academic_year_id" 
                    class="form-control"
                    :disabled="mode === 'create'"
                  >
                    <option v-if="mode === 'create'" :value="null" selected>
                      {{ currentYearName || 'Loading...' }}
                    </option>
                    <option v-else :value="null">Select Year</option>
                    <option v-for="year in academicYears" :key="year._id" :value="year._id">
                      {{ year.name }}
                    </option>
                  </select>
                  <small v-if="mode === 'create'" class="text-muted">Auto-assigned based on current year</small>
                  <small v-else class="text-muted">Select to upgrade to new academic year</small>
                </div>
                </div>
              </div>

          </div>
        </div>

        <div class="card-footer d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-light" @click="close">Close</button>

          <button type="submit" class="btn btn-primary">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            {{ mode === 'edit' ? 'Update' : 'Save' }}
          </button>
        </div>

      </form>
    </div>
  </div>
</div>
`;
