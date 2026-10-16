export default `
<div class="catalog-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="examEditorTitle">
  <section class="catalog-editor-modal">
    <header class="catalog-editor-header"><span class="catalog-editor-icon exam-editor-icon"><i class="fa-regular fa-calendar-check"></i></span><div><h2 id="examEditorTitle">{{ mode === 'edit' ? 'Edit Exam' : 'Add Exam' }}</h2><p>Set examination details and academic year</p></div><button type="button" class="catalog-editor-close" @click="close" aria-label="Close dialog"><i class="fa-solid fa-xmark"></i></button></header>
    <div v-if="loading" class="catalog-editor-loading"><span class="spinner-border"></span><span>Loading exam details…</span></div>
    <template v-else>
      <div class="catalog-editor-fields">
        <div class="catalog-editor-field"><label for="examName">Exam Name</label><input id="examName" v-model="exam.exam_name" class="form-control" placeholder="Enter exam name" /></div>
        <div class="catalog-editor-field"><label for="examMarks">Maximum Marks</label><input id="examMarks" type="number" min="0" v-model.number="exam.max_marks" class="form-control" placeholder="Enter maximum marks" /></div>
        <div class="catalog-editor-field"><label for="examYear">Academic Year</label><select id="examYear" v-model="exam.academic_year_id" class="form-select"><option :value="null">Select academic year</option><option v-for="y in years" :value="y._id" :key="y._id">{{ y.name }}</option></select></div>
      </div>
      <footer class="catalog-editor-footer"><button type="button" class="catalog-editor-cancel" @click="close">Cancel</button><button type="button" class="catalog-editor-save" :disabled="saving" @click="save"><span v-if="saving" class="spinner-border spinner-border-sm me-2"></span><i v-else class="fa-regular fa-floppy-disk me-2"></i>{{ mode === 'edit' ? 'Update Exam' : 'Save Exam' }}</button></footer>
    </template>
  </section>
</div>
`;
