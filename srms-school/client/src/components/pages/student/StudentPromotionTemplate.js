export default `
<section class="catalog-page student-promotion-page">
  <header class="catalog-page-heading">
    <div><p class="marksheet-eyebrow">STUDENT ACADEMICS</p><h1>Promote Students</h1><p>Move one or more students into another course. Their new course subjects will be assigned automatically.</p></div>
  </header>

  <section class="catalog-card student-promotion-card">
    <header class="student-promotion-heading"><div><span class="marksheet-step">01</span><div><h2>Promotion setup</h2><p>Choose students, destination course, and academic year.</p></div></div><span class="marksheet-selected-count"><i class="fa-solid fa-user-check"></i>{{ selectedIds.length }} selected</span></header>

    <div class="student-promotion-filters">
      <label class="catalog-editor-field"><span>Current course</span><select v-model="currentCourseId" class="form-select"><option value="">All courses</option><option v-for="course in courses" :key="course._id" :value="course._id">{{ course.course_name || course.name }}</option></select></label>
      <label class="catalog-editor-field"><span>Promote to course <b>*</b></span><select v-model="targetCourseId" class="form-select"><option value="">Select destination course</option><option value="__NEXT__">Next course for each student</option><option v-for="course in courses" :key="course._id" :value="course._id">{{ course.course_name || course.name }}</option></select></label>
      <label class="catalog-editor-field"><span>Academic year</span><select v-model="academicYearId" class="form-select"><option value="">Keep each student's current year</option><option v-for="year in academicYears" :key="year._id" :value="year._id">{{ year.name }}</option></select></label>
      <label class="catalog-editor-field student-promotion-search"><span>Search students</span><input v-model="search" class="form-control" type="search" placeholder="Name, roll number or admission number" /></label>
    </div>

    <div class="student-promotion-destination" v-if="targetCourseId"><i class="fa-solid fa-circle-info"></i><span v-if="targetCourseId === '__NEXT__'">Each student advances to the next numbered course based on their current course. If the next course is ambiguous, choose a destination manually. Subjects from the destination course are assigned automatically.</span><span v-else>Selected students will move to <strong>{{ selectedTargetCourse?.course_name || selectedTargetCourse?.name }}</strong>. Subjects assigned to that course will be added to each student.</span></div>

    <div class="student-promotion-table-wrap">
      <table class="catalog-table student-promotion-table">
        <thead><tr><th><input type="checkbox" :checked="allVisibleSelected" :disabled="!visibleStudents.length" @change="toggleAllVisible" aria-label="Select all visible students" /></th><th>#</th><th>Student</th><th>Roll number</th><th>Current course</th><th>Academic year</th></tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="6" class="student-promotion-state"><span class="spinner-border spinner-border-sm me-2"></span>Loading students…</td></tr>
          <tr v-else-if="!visibleStudents.length"><td colspan="6" class="student-promotion-state">No students match these filters.</td></tr>
          <tr v-for="(student, index) in visibleStudents" :key="student._id">
            <td><input type="checkbox" :checked="selectedIds.includes(String(student._id))" @change="toggleStudent(student._id)" :aria-label="'Select ' + student.name" /></td>
            <td>{{ index + 1 }}</td><td><strong>{{ student.name }}</strong></td><td>{{ student.roll_number || '—' }}</td><td>{{ courseName(student.class) }}</td><td>{{ yearName(student.academic_year_id) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="student-promotion-footer"><p>Students move to the selected course and become available in its class lists.</p><button type="button" class="catalog-editor-save" :disabled="saving || !selectedIds.length || !targetCourseId" @click="promote"><span v-if="saving" class="spinner-border spinner-border-sm me-2"></span><i v-else class="fa-solid fa-arrow-up-right-dots me-2"></i>{{ saving ? 'Promoting…' : 'Promote selected' }}<span v-if="!saving"> · {{ selectedIds.length }}</span></button></footer>
  </section>
</section>
`
