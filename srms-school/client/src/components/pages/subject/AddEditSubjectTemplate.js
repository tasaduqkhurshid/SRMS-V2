export default `
<div v-if="open" class="subject-editor-overlay" role="dialog" aria-modal="true" aria-labelledby="subjectEditorTitle">
  <section class="subject-editor-modal">
    <header class="subject-editor-header">
      <span class="subject-editor-title-icon"><i class="fa-solid fa-book-open"></i></span>
      <div><h2 id="subjectEditorTitle">{{ mode === 'edit' ? 'Edit Subject' : 'Add Subject' }}</h2><p>Update subject details and settings</p></div>
      <button type="button" class="subject-editor-close" @click="close" aria-label="Close dialog"><i class="fa-solid fa-xmark"></i></button>
    </header>
    <form id="subjectForm" data-vform @validated-submit="saveSubject" class="subject-editor-form">
      <div class="subject-editor-fields">
        <div class="subject-editor-field subject-name-field"><label for="subjectName"><span><i class="fa-solid fa-font"></i></span>Subject Name <b>*</b></label><input id="subjectName" class="form-control" v-model="subject.subject_name" data-vtype="text" required placeholder="Enter subject name" /></div>
        <div class="subject-editor-field"><label for="subjectCode"><span><i class="fa-solid fa-code"></i></span>Subject Code <b>*</b></label><input id="subjectCode" class="form-control" v-model="subject.subject_code" data-vtype="text" required placeholder="Enter subject code" /></div>
        <div class="subject-editor-field"><label for="subjectTheory"><span class="subject-setting-green"><i class="fa-regular fa-file-lines"></i></span>Has Theory</label><select id="subjectTheory" class="form-select" v-model="subject.has_theory"><option :value="true">Yes</option><option :value="false">No</option></select></div>
        <div class="subject-editor-field"><label for="subjectLab"><span class="subject-setting-blue"><i class="fa-solid fa-flask"></i></span>Has Lab</label><select id="subjectLab" class="form-select" v-model="subject.has_lab"><option :value="true">Yes</option><option :value="false">No</option></select></div>
        <div class="subject-editor-field"><label for="subjectAttendance"><span class="subject-setting-orange"><i class="fa-regular fa-calendar-check"></i></span>Has Attendance</label><select id="subjectAttendance" class="form-select" v-model="subject.has_attendance"><option :value="true">Yes</option><option :value="false">No</option></select></div>
        <div class="subject-editor-field"><label for="subjectActivity"><span><i class="fa-solid fa-chart-column"></i></span>Has Activity</label><select id="subjectActivity" class="form-select" v-model="subject.has_activity"><option :value="true">Yes</option><option :value="false">No</option></select></div>
      </div>
      <footer class="subject-editor-footer"><button type="button" class="subject-editor-cancel" @click="close">Close</button><button type="submit" class="subject-editor-save" :disabled="saving"><span v-if="saving" class="spinner-border spinner-border-sm me-2"></span><i v-else class="fa-regular fa-floppy-disk me-2"></i>{{ mode === 'edit' ? 'Update' : 'Save' }}</button></footer>
    </form>
  </section>
</div>
`;
