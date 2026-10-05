export default `
<section class="container py-3">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="m-0">Courses</h2>
    <button class="btn btn-success" @click="addCourse">Add Course</button>
  </div>

  <CourseList ref="courseList" @edit="handleEdit" @openAssignModal="openAssignModal" />

  <AddEditCourse v-if="isEdit"
    :open="isEdit"
    :mode="mode"
    :courseId="selectedCourseId"
    @close="closeCourse"
    @saved="onSaved"
  />

  <AssignSubjectModal v-if="showAssignModal"
    :open="showAssignModal"
    :entityType="selectedEntityType"
    :entityId="selectedEntityId"
    @close="showAssignModal = false"
    @saved="onAssignModalSaved"
  />
</section>
`