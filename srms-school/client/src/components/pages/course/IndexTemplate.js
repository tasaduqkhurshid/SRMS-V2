export default `
<section class="catalog-page">
  <header class="catalog-page-heading"><div><h1>Courses</h1><p>Manage classes, course details and assigned subjects</p></div><button class="catalog-add-button" @click="addCourse"><i class="fa-solid fa-plus"></i>Add Course</button></header>
  <CourseList ref="courseList" @edit="handleEdit" @openAssignModal="openAssignModal" />
  <AddEditCourse v-if="isEdit" :open="isEdit" :mode="mode" :courseId="selectedCourseId" @close="closeCourse" @saved="onSaved" />
  <AssignSubjectModal v-if="showAssignModal" :open="showAssignModal" :entityType="selectedEntityType" :entityId="selectedEntityId" @close="showAssignModal = false" @saved="onAssignModalSaved" />
</section>
`;
