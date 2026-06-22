export default `
<section class="container py-3">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="m-0">Subjects</h2>
    <button class="btn btn-success" @click="addSubject">Add Subject</button>
  </div>

  <SubjectList ref="subjectList" @edit="handleEdit" />

  <AddEditSubject v-if="isEdit"
    :open="isEdit"
    :mode="mode"
    :subjectId="selectedSubjectId"
    @close="closeSubject"
    @saved="onSaved"
  />
</section>
`;
