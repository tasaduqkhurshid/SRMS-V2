export default `
<div v-if="isFetched" class="student-profile-overlay" role="dialog" aria-modal="true" aria-labelledby="studentProfileTitle">
  <section class="student-profile-modal">
    <header class="student-profile-header">
      <span class="student-profile-title-icon"><i class="fa-regular fa-user"></i></span>
      <div><h2 id="studentProfileTitle">Student Profile</h2><p>View student details and academic information</p></div>
      <button type="button" class="student-profile-close" @click="$emit('close')" aria-label="Close profile"><i class="fa-solid fa-xmark"></i></button>
    </header>

    <div class="student-profile-content">
      <aside class="student-profile-summary">
        <img v-if="photoUrl" class="student-profile-photo" :src="photoUrl" alt="Student photo" />
        <div v-else class="student-profile-avatar">{{ (student?.name || 'S').split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase() }}</div>
        <h3>{{ student?.name || '—' }}</h3>
        <span class="student-profile-class"><i class="fa-solid fa-graduation-cap"></i> Class {{ student?.class || '—' }}<span v-if="student?.section"> · Section {{ student.section }}</span></span>
        <div class="student-profile-quick-info">
          <div><span class="quick-info-icon quick-blue"><i class="fa-regular fa-user"></i></span><p><small>Student #</small><strong>{{ student?._id || '—' }}</strong></p></div>
          <div><span class="quick-info-icon quick-green"><i class="fa-regular fa-file-lines"></i></span><p><small>Admission #</small><strong>{{ student?.admission_number || '—' }}</strong></p></div>
          <div><span class="quick-info-icon quick-orange"><i class="fa-regular fa-id-card"></i></span><p><small>Student ID</small><strong>{{ student?.student_code || '—' }}</strong></p></div>
          <div><span class="quick-info-icon quick-purple"><i class="fa-solid fa-people-group"></i></span><p><small>Class Roll No</small><strong>{{ student?.roll_number || '—' }}</strong></p></div>
        </div>
      </aside>

      <div class="student-profile-details">
        <section class="profile-detail-panel">
          <h3><i class="fa-regular fa-file-lines"></i> General Information</h3>
          <dl class="student-profile-data">
            <div><dt>Class Roll No</dt><span>:</span><dd>{{ student?.roll_number || '—' }}</dd></div>
            <div><dt>Gender</dt><span>:</span><dd>{{ student?.gender || '—' }}</dd></div>
            <div><dt>Father's Name</dt><span>:</span><dd>{{ student?.father_name || '—' }}</dd></div>
            <div><dt>Mother's Name</dt><span>:</span><dd>{{ student?.mother_name || '—' }}</dd></div>
            <div><dt>Date of Birth</dt><span>:</span><dd>{{ student?.dob ? student.dob.slice(0,10) : '—' }}</dd></div>
            <div><dt>Address</dt><span>:</span><dd>{{ student?.address || '—' }}<template v-if="student?.pincode">, {{ student.pincode }}</template></dd></div>
          </dl>
        </section>

        <section class="profile-detail-panel profile-other-panel">
          <div class="profile-other-heading"><h3><i class="fa-solid fa-book-open"></i> Other Information</h3><div class="profile-actions"><button type="button" class="profile-back-button" @click="$emit('close')"><i class="fa-solid fa-arrow-left"></i> Back to list</button><button type="button" class="profile-edit-button" @click="editStudent(student._id)"><i class="fa-solid fa-pen"></i> Edit Student</button></div></div>
          <div class="profile-extra-row"><h4><i class="fa-solid fa-book-open"></i> Subjects</h4><div v-if="assignedSubjects && assignedSubjects.length" class="profile-subjects"><span v-for="s in assignedSubjects" :key="s._id">{{ s.subject_name }}</span></div><p v-else>No subjects assigned</p></div>
          <div class="profile-extra-row profile-notes-row"><h4><i class="fa-regular fa-file-lines"></i> Notes</h4><p v-if="student?.notes">{{ student.notes }}</p><p v-else>No additional notes.</p></div>
        </section>
      </div>
    </div>
  </section>
</div>
`;
