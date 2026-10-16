export default `
<div v-if="open" class="student-editor-overlay" role="dialog" aria-modal="true" aria-labelledby="studentEditorTitle">
  <section class="student-editor-modal">
    <header class="student-editor-header">
      <span class="student-editor-title-icon"><i class="fa-solid fa-user-plus"></i></span>
      <div>
        <h2 id="studentEditorTitle">{{ mode === 'edit' ? 'Edit Student' : 'Add Student' }}</h2>
        <p>{{ mode === 'edit' ? 'Update student profile and portal account' : 'Create a student profile and portal account' }}</p>
      </div>
      <button type="button" class="student-editor-close" @click="close" aria-label="Close dialog"><i class="fa-solid fa-xmark"></i></button>
    </header>

    <form id="studentForm" class="student-editor-form" data-vform @validated-submit="saveStudentDetails">
      <div class="student-editor-body">
        <aside class="student-photo-panel">
          <div class="student-photo-heading">
            <h3>Student Photo</h3>
            <p>Upload a student photo (optional)</p>
          </div>
          <div class="student-photo-preview">
            <img v-if="previewUrl || student.image" :src="previewUrl || student.image" alt="Student photo preview" />
            <div v-else class="student-photo-placeholder"><i class="fa-solid fa-user"></i></div>
            <span v-if="!previewUrl && !student.image">No photo selected</span>
          </div>
          <p class="student-photo-help">JPG or PNG · Max 2 MB</p>
          <input id="studentPhotoInput" ref="fileInputRef" class="visually-hidden" type="file" accept="image/jpeg,image/png" @change="onFileChange" />
          <label for="studentPhotoInput" class="btn student-photo-choose"><i class="fa-solid fa-upload"></i>Choose Photo</label>
          <button type="button" class="btn student-photo-remove" @click="clearFile" :disabled="!hasFile"><i class="fa-solid fa-trash-can"></i>Remove Photo</button>
        </aside>

        <div class="student-editor-fields">
          <section class="student-form-section">
            <header class="student-form-section-heading">
              <span class="student-form-section-icon student-info-icon"><i class="fa-solid fa-circle-info"></i></span>
              <div><h3>Student Information</h3><p>Enter the student's personal and academic details</p></div>
            </header>

            <div class="student-form-grid">
              <div class="student-form-field">
                <label for="studentRoll">Class Roll No</label>
                <input id="studentRoll" class="form-control" v-model="student.roll_number" data-vtype="number" placeholder="Enter class roll number" />
              </div>
              <div class="student-form-field">
                <label for="studentName">Student Name <span>*</span></label>
                <input id="studentName" class="form-control" v-model="student.name" data-vtype="text" data-vmin="2" required placeholder="Enter student name" />
              </div>
              <div class="student-form-field">
                <label for="studentFather">Father's Name</label>
                <input id="studentFather" class="form-control" v-model="student.father_name" data-vtype="text" placeholder="Enter father's name" />
              </div>
              <div class="student-form-field">
                <label for="studentMother">Mother's Name</label>
                <input id="studentMother" class="form-control" v-model="student.mother_name" data-vtype="text" placeholder="Enter mother's name" />
              </div>
              <div class="student-form-field student-address-field">
                <label for="studentAddress">Address</label>
                <textarea id="studentAddress" class="form-control" rows="2" v-model="student.address" data-vtype="text" placeholder="Enter full address"></textarea>
              </div>
              <div class="student-form-field">
                <label for="studentPincode">Pincode</label>
                <input id="studentPincode" class="form-control" v-model="student.pincode" data-vtype="number" placeholder="Enter pincode" />
              </div>
              <div class="student-form-field">
                <label for="studentClass">Class <span>*</span></label>
                <select id="studentClass" class="form-select" v-model="student.class" data-vtype="select" required>
                  <option value="">Select class</option>
                  <option v-for="course in courses" :key="course._id" :value="course._id">{{ course.course_name }} ({{ course.course_code }})</option>
                </select>
              </div>
              <div class="student-form-field">
                <label for="studentSection">Section</label>
                <input id="studentSection" class="form-control" v-model="student.section" data-vtype="text" placeholder="Enter section" />
              </div>
              <div class="student-form-field">
                <label for="studentGender">Gender</label>
                <select id="studentGender" class="form-select" v-model="student.gender" data-vtype="select">
                  <option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div class="student-form-field">
                <label for="studentDob">Date of Birth</label>
                <input id="studentDob" type="date" class="form-control" v-model="student.dob" data-vtype="date" />
              </div>
              <div class="student-form-field">
                <label for="studentAdmission">Admission Number</label>
                <input id="studentAdmission" class="form-control" v-model="student.admission_number" data-vtype="text" placeholder="Enter admission number" />
              </div>
            </div>
          </section>

          <section class="student-form-section student-portal-section">
            <header class="student-form-section-heading">
              <span class="student-form-section-icon student-portal-icon"><i class="fa-solid fa-lock"></i></span>
              <div><h3>Student Portal Access</h3><p>Set a password for the student's portal account</p></div>
            </header>
            <div class="student-form-grid student-portal-grid">
              <div class="student-form-field">
                <label for="studentPortalPassword">Student Portal Password <span v-if="mode === 'create'">*</span></label>
                <div class="student-password-control">
                  <input id="studentPortalPassword" class="form-control" v-model="studentPortalPassword" :type="showPortalPassword ? 'text' : 'password'" minlength="8" autocomplete="new-password" :required="mode === 'create'" placeholder="At least 8 characters" />
                  <button type="button" @click="togglePortalPassword" :aria-label="showPortalPassword ? 'Hide password' : 'Show password'"><i :class="showPortalPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i></button>
                </div>
                <small>Students sign in using their admission number or roll number and this password.</small>
              </div>
              <div class="student-form-field">
                <label for="studentAcademicYear">Academic Year</label>
                <input v-if="mode === 'create'" id="studentAcademicYear" class="form-control student-academic-year" :value="currentYearName" disabled />
                <select v-else id="studentAcademicYear" v-model="student.academic_year_id" class="form-select">
                  <option :value="null">Select Year</option>
                  <option v-for="year in academicYears" :key="year._id" :value="year._id">{{ year.name }}</option>
                </select>
                <small>{{ mode === 'create' ? 'Automatically assigned based on the current academic year.' : 'Select to upgrade to a new academic year.' }}</small>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer class="student-editor-footer">
        <button type="button" class="btn student-editor-cancel" @click="close">Cancel</button>
        <button type="submit" class="btn student-editor-save" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span><i v-else class="fa-solid fa-floppy-disk me-2"></i>
          {{ mode === 'edit' ? 'Update Student' : 'Save Student' }}
        </button>
      </footer>
    </form>
  </section>
</div>
`;
