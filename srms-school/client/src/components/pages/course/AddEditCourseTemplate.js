export default `
<div v-if="open" class="catalog-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="courseEditorTitle">
  <section class="catalog-editor-modal">
    <header class="catalog-editor-header"><span class="catalog-editor-icon"><i class="fa-solid fa-graduation-cap"></i></span><div><h2 id="courseEditorTitle">{{ mode === 'edit' ? 'Edit Course' : 'Add Course' }}</h2><p>Manage course details and class information</p></div><button type="button" class="catalog-editor-close" @click="close" aria-label="Close dialog"><i class="fa-solid fa-xmark"></i></button></header>
    <div class="catalog-editor-fields">
      <div class="catalog-editor-field"><label for="courseName">Course Name</label><input id="courseName" class="form-control" v-model="course.course_name" placeholder="Enter course name" /></div>
      <div class="catalog-editor-field"><label for="courseCode">Course Code</label><input id="courseCode" class="form-control" v-model="course.course_code" placeholder="Enter course code" /></div>
      <div class="catalog-editor-field"><label for="courseDescription">Description</label><textarea id="courseDescription" class="form-control" rows="4" v-model="course.description" placeholder="Add a short description"></textarea></div>
    </div>
    <footer class="catalog-editor-footer"><button type="button" class="catalog-editor-cancel" @click="close">Cancel</button><button type="button" class="catalog-editor-save" :disabled="saving" @click="save"><span v-if="saving" class="spinner-border spinner-border-sm me-2"></span><i v-else class="fa-regular fa-floppy-disk me-2"></i>{{ mode === 'edit' ? 'Update Course' : 'Save Course' }}</button></footer>
  </section>
</div>
`;
