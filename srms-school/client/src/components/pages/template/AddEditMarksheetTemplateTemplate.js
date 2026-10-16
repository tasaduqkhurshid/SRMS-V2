export default `
<section class="catalog-page results-report-page marksheet-template-editor-page">
  <header class="catalog-page-heading"><div><h1>{{ isEdit ? 'Edit' : 'Add' }} Marksheet Template</h1><p>Build a reusable marksheet with student and result fields</p></div><button type="button" class="results-clear-button" @click="router.back()"><i class="fa-solid fa-arrow-left me-2"></i>Back to templates</button></header>
  <div v-if="loading" class="catalog-card catalog-editor-loading"><span class="spinner-border"></span><span>Loading template…</span></div>
  <section v-else class="catalog-card marksheet-template-editor-card">
    <header class="marksheet-template-card-header"><div><h2>Template Details</h2><p>Choose a name, status and HTML content for this template.</p></div><button type="button" class="catalog-editor-save" :disabled="saving" @click="saveTemplate"><span v-if="saving" class="spinner-border spinner-border-sm me-2"></span><i v-else class="fa-regular fa-floppy-disk me-2"></i>{{ saving ? 'Saving…' : 'Save Template' }}</button></header>
    <div class="marksheet-template-fields">
      <div class="catalog-editor-field"><label for="templateName">Template Name *</label><input id="templateName" v-model="form.name" type="text" class="form-control" placeholder="e.g. Professional Classic" /></div>
      <label class="template-active-control"><input v-model="form.is_active" type="checkbox" /><span><strong>Active template</strong><small>Available in marksheet generation</small></span></label>
      <div v-if="isEdit" class="catalog-editor-field template-id-field"><label>Template ID</label><input :value="form._id" type="text" class="form-control" readonly /></div>
    </div>
    <div class="marksheet-placeholder-toolbar"><div><strong>Insert supported fields</strong><small>Click a field to append its placeholder to the template.</small></div><div><button v-for="placeholder in placeholders" :key="placeholder.value" type="button" @click="insertPlaceholder(placeholder.value)">{{ placeholder.text }}</button><button type="button" class="marksheet-sample-button" @click="insertSampleMarksheet"><i class="fa-solid fa-wand-magic-sparkles"></i>Insert Sample</button></div></div>
    <div class="marksheet-editor-canvas"><textarea v-model="form.html_content" id="html_editor" aria-label="Template HTML"></textarea></div>
  </section>
</section>
`;
