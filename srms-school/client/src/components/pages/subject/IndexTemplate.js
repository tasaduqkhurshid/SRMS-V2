export default `
<section class="subjects-layout">
  <div class="subjects-page-heading">
    <div>
      <h1>Subjects</h1>
      <p>Manage subjects, theory and lab settings</p>
    </div>
    <button class="btn subjects-add-button" @click="addSubject">
      <i class="fa-solid fa-plus"></i> Add Subject
    </button>
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
