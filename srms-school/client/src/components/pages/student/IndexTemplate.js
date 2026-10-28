export default `
<section class="students-layout">
  <div class="dashboard-hero mb-3">
    <div class="dashboard-hero-left">
      <span class="dashboard-hero-label">School Admin</span>
      <h1 class="dashboard-hero-title">Students</h1>
      <p class="dashboard-hero-subtitle">Manage student records and admissions</p>
    </div>
    <div class="dashboard-hero-right">
      <button class="btn btn-success dashboard-hero-btn" @click="addStudent">
        <i class="fa-solid fa-plus me-1"></i> Add Student
      </button>
    </div>
  </div>

  <!-- Student list component -->
  <StudentList ref="studentList" @edit="handleEdit" @view="handleView" @assign="handleAssign" @add="addStudent" />

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
    ref="studentProfile"
    :open="isView"
    :studentId="selectedStudentId"
    @edit="handleEdit"
    @assign-subjects="handleAssign"
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
