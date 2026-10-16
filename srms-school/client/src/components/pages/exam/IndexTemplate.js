export default `
<section class="catalog-page">
  <header class="catalog-page-heading"><div><h1>Exams</h1><p>Manage examinations and academic year details</p></div><button class="catalog-add-button" @click="addExam"><i class="fa-solid fa-plus"></i>Add Exam</button></header>
  <ExamList ref="examListRef" @editExam="handleEdit" />
  <AddEditExam v-if="isEdit" :mode="mode" :examId="selectedExamId" @close="close" @saved="onSaved" />
</section>
`;
