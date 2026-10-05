export default `<div class="container-fluid">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h3 class="m-0">Exams</h3>
    <button class="btn btn-primary" @click="addExam">Add Exam</button>
  </div>

  <ExamList ref="examListRef" @editExam="handleEdit" />

  <AddEditExam v-if="isEdit" :mode="mode" :examId="selectedExamId" @close="close" @saved="onSaved" />
</div>`;