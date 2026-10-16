export default `
<section class="catalog-card exam-catalog-card">
  <div class="catalog-toolbar"><div class="catalog-toolbar-note"><i class="fa-regular fa-calendar-check"></i><span>Examination schedule</span></div></div>
  <div class="catalog-table-wrap">
    <table class="catalog-table exam-table">
      <thead><tr><th class="catalog-number-col">#</th><th>Exam Name</th><th>Max Marks</th><th>Academic Year</th><th class="catalog-actions-col">Actions</th></tr></thead>
      <tbody>
        <tr v-for="(exam,index) in exams" :key="exam._id"><td>{{ index + 1 }}</td><td><strong>{{ exam.exam_name }}</strong></td><td><span class="exam-marks-value">{{ exam.max_marks }}</span></td><td><span class="exam-year-value">{{ exam.academic_year && exam.academic_year.name ? exam.academic_year.name : '—' }}</span></td><td><div class="catalog-actions"><button type="button" class="catalog-icon-button" title="Edit exam" aria-label="Edit exam" @click="editExam(exam._id)"><i class="fa-solid fa-pen"></i></button></div></td></tr>
        <tr v-if="!loading && exams.length === 0"><td colspan="5" class="catalog-empty-row">No exams found</td></tr>
      </tbody>
    </table>
    <div v-if="loading" class="catalog-loading"><span class="spinner-border spinner-border-sm"></span>Loading exams…</div>
  </div>
  <footer class="catalog-footer"><span>Showing {{ exams.length }} {{ exams.length === 1 ? 'exam' : 'exams' }}</span></footer>
</section>
`;
