export default `
<section class="catalog-page results-report-page">
  <header class="catalog-page-heading"><div><h1>Student-wise Results</h1><p>Review a student's marks across exams and academic years</p></div></header>
  <section class="catalog-card results-report-card">
    <form class="results-filter-grid" @submit.prevent="applyFilters">
      <div class="results-filter-field"><label for="studentFilter">Student</label><select id="studentFilter" v-model="filters.student_id"><option :value="null">All Students</option><option v-for="student in students" :key="student._id" :value="student._id">{{ student.name }} ({{ student.roll_number }})</option></select></div>
      <div class="results-filter-field"><label for="studentYear">Academic Year</label><select id="studentYear" v-model="filters.academic_year_id"><option :value="null">All Years</option><option v-for="year in academicYears" :key="year._id" :value="year._id">{{ year.name }}</option></select></div>
      <div class="results-filter-field"><label for="studentExam">Exam</label><select id="studentExam" v-model="filters.exam_id"><option :value="null">All Exams</option><option v-for="exam in exams" :key="exam._id" :value="exam._id">{{ exam.exam_name || exam.name }}</option></select></div>
      <div class="results-filter-actions"><button type="submit" class="catalog-search-button" :disabled="loading"><i class="fa-solid fa-filter"></i>Filter</button><button type="button" class="results-clear-button" @click="resetFilters">Clear</button></div>
    </form>
    <div class="results-table-toolbar"><div><h2>Student Results</h2><p>{{ totalRecords }} records</p></div><label class="results-inline-search"><i class="fa-solid fa-magnifying-glass"></i><input v-model="search" placeholder="Search student, exam or subject" aria-label="Search results" /></label></div>
    <div class="catalog-table-wrap results-table-wrap"><table class="catalog-table results-table student-results-table"><thead><tr><th>Student</th><th>Roll Number</th><th>Exam</th><th>Subject</th><th>Theory</th><th>Lab</th><th>Attendance</th><th>Activity</th><th>Total</th><th>Academic Year</th><th>Actions</th></tr></thead><tbody>
      <tr v-if="loading"><td colspan="11" class="results-state"><span class="spinner-border spinner-border-sm me-2"></span>Loading results…</td></tr>
      <tr v-else-if="!pageResults.length"><td colspan="11" class="results-state">No results found. Try changing the filters.</td></tr>
      <tr v-for="result in pageResults" :key="result._id"><td><strong>{{ result.student_id?.name || result.Student?.name || '—' }}</strong></td><td>{{ result.student_id?.roll_number || result.Student?.roll_number || '—' }}</td><td>{{ result.exam_id?.exam_name || result.Exam?.exam_name || '—' }}</td><td>{{ result.subject_id?.subject_name || result.Subject?.subject_name || '—' }}</td><td>{{ result.theory_marks ?? '—' }}</td><td>{{ result.lab_marks ?? '—' }}</td><td>{{ result.attendance_marks ?? '—' }}</td><td>{{ result.activity_marks ?? '—' }}</td><td><strong>{{ result.total_marks ?? '—' }}</strong></td><td>{{ result.academic_year_id?.name || result.AcademicYear?.name || '—' }}</td><td><button type="button" class="catalog-icon-button" title="Edit marks" aria-label="Edit marks" @click="openResultBook(result)"><i class="fa-solid fa-pen"></i></button></td></tr>
    </tbody></table></div>
    <footer class="catalog-footer results-pagination"><span>Showing {{ results.length ? ((filters.page - 1) * filters.limit + 1) : 0 }}–{{ Math.min(filters.page * filters.limit, totalRecords) }} of {{ totalRecords }} results</span><div><button type="button" :disabled="filters.page <= 1 || loading" @click="changePage(filters.page - 1)">Previous</button><span>Page {{ filters.page }} of {{ Math.max(totalPages, 1) }}</span><button type="button" :disabled="filters.page >= totalPages || loading" @click="changePage(filters.page + 1)">Next</button></div></footer>
  </section>
</section>
`;
