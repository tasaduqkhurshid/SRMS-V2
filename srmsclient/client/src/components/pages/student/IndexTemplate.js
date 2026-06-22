export default `
<section class="container py-3">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="m-0">Students</h2>
    <button class="btn btn-success" @click="addStudent">Add Student</button>
  </div>

  <!-- Student list component -->
  <StudentList ref="studentList" @edit="handleEdit" @view="handleView" @assign="handleAssign" />

  <!-- Add/Edit Modal -->
  <AddEditStudent v-if="isEdit"
    :open="isEdit"
    :mode="mode"
    :studentId="selectedStudentId"
    @close="closeStudent"
    @saved="onSaved"
  />

  <!-- View Modal -->
  <StudentProfile v-if="isView"
    :open="isView"
    :studentId="selectedStudentId"
    @edit="handleEdit"
    @close="closeStudent"
  />  

  <StudentSubjectsModal v-if="showSubjectsModal"
    :open="showSubjectsModal"
    entityType="student"
    :entityId="studentForSubjects"
    @close="showSubjectsModal = false"
    @saved="onSubjectsSaved"
  />
</section>
`;
