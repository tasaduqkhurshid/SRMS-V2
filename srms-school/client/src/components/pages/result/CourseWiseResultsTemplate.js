export default `
<section class="catalog-page results-report-page">
  <header class="catalog-page-heading"><div><h1>Course-wise Results</h1><p>Review class performance and recorded marks by exam</p></div><button class="catalog-add-button results-entry-button" :disabled="!loaded" @click="openResultBook"><i class="fa-solid fa-pen-to-square"></i>Enter / Edit Marks</button></header>
  <section class="catalog-card results-report-card">
    <form class="results-filter-grid" @submit.prevent="applyFilters">
      <div class="results-filter-field"><label for="courseYear">Academic Year</label><select id="courseYear" v-model="filters.academic_year_id" :disabled="filtersLoading"><option value="">Select academic year</option><option v-for="year in academicYears" :key="year._id" :value="year._id">{{ year.name }}</option></select></div>
      <div class="results-filter-field"><label for="courseFilter">Course / Class</label><select id="courseFilter" v-model="filters.course_id" :disabled="filtersLoading"><option value="">Select course</option><option v-for="course in courses" :key="course._id" :value="course._id">{{ course.course_name || course.name }}</option></select></div>
      <div class="results-filter-field"><label for="courseExam">Exam</label><select id="courseExam" v-model="filters.exam_id" :disabled="filtersLoading || !filters.academic_year_id"><option value="">Select exam</option><option v-for="exam in availableExams" :key="exam._id" :value="exam._id">{{ exam.exam_name || exam.name }}</option></select></div>
      <div class="results-filter-actions"><button class="catalog-search-button" type="submit" :disabled="loading"><i class="fa-solid fa-magnifying-glass"></i>{{ loading ? 'Loading…' : 'Show Results' }}</button><button type="button" class="results-clear-button" @click="clearFilters">Clear</button></div>
    </form>
    <div class="results-table-toolbar"><div><h2>Class Results</h2><p v-if="loaded">{{ selectedCourse?.course_name }} · {{ selectedExam?.exam_name }} · {{ rows.length }} students</p><p v-else>Select a year, course and exam to view results</p></div><label class="results-inline-search"><i class="fa-solid fa-magnifying-glass"></i><input v-model="search" placeholder="Search student or roll number" aria-label="Search student results" /></label></div>
    <div class="catalog-table-wrap results-table-wrap">
      <table class="catalog-table results-table course-results-table"><thead><tr><th>#</th><th>Student</th><th>Roll No.</th><th>Recorded Marks</th><th>Subjects</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="6" class="results-state"><span class="spinner-border spinner-border-sm me-2"></span>Loading course results…</td></tr>
          <tr v-else-if="!loaded"><td colspan="6" class="results-state">Choose filters to load course results.</td></tr>
          <tr v-else-if="students.length === 0"><td colspan="6" class="results-state">No students are enrolled in this course for the selected academic year.</td></tr>
          <tr v-else-if="!pageRows.length"><td colspan="6" class="results-state">No students match this search.</td></tr>
          <tr v-for="(row,index) in pageRows" :key="row.id"><td>{{ (page - 1) * pageSize + index + 1 }}</td><td><strong>{{ row.student.name || '—' }}</strong></td><td>{{ row.student.roll_number || '—' }}</td><td><span v-if="row.results.length" class="result-summary-chip">{{ row.results.length }} recorded</span><span v-else class="result-missing-chip">No marks</span></td><td><div v-if="row.results.length" class="result-subject-breakdown"><span v-for="result in row.results" :key="result._id">{{ result.subject_id?.subject_name || 'Subject' }}: {{ markLabel(result) }}</span></div><span v-else class="result-muted">Marks have not been entered</span></td><td><button class="catalog-icon-button" type="button" title="Enter or edit marks" aria-label="Enter or edit marks" @click="openResultBook"><i class="fa-solid fa-pen"></i></button></td></tr>
        </tbody>
      </table>
    </div>
    <footer class="catalog-footer results-pagination"><span>Showing {{ pageRows.length ? ((page - 1) * pageSize + 1) : 0 }}–{{ Math.min(page * pageSize, rows.length) }} of {{ rows.length }} students</span><div><button type="button" :disabled="page <= 1" @click="changePage(page - 1)">Previous</button><span>Page {{ page }} of {{ Math.max(totalPages, 1) }}</span><button type="button" :disabled="page >= totalPages" @click="changePage(page + 1)">Next</button><select v-model.number="pageSize" @change="changePage(1)" aria-label="Rows per page"><option :value="10">10</option><option :value="20">20</option><option :value="50">50</option></select></div></footer>
  </section>
</section>
`;
