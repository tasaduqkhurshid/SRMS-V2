export default `
<section class="catalog-page results-report-page marksheet-template-editor-page">
  <div v-if="loading" class="catalog-card catalog-editor-loading"><span class="spinner-border"></span><span>Loading template…</span></div>
  <section v-else class="catalog-card marksheet-template-editor-card">
    <header class="marksheet-template-card-header"><div><h2>Template Details</h2><p>Edit the template visually or switch to raw HTML code.</p></div><div class="marksheet-editor-header-actions"><button type="button" class="catalog-editor-save" :disabled="saving" @click="saveTemplate"><span v-if="saving" class="spinner-border spinner-border-sm me-2"></span><i v-else class="fa-regular fa-floppy-disk me-2"></i>{{ saving ? 'Saving…' : 'Save Template' }}</button></div></header>
    <div class="marksheet-template-fields">
      <div class="catalog-editor-field"><label for="templateName">Template Name *</label><input id="templateName" v-model="form.name" type="text" class="form-control" placeholder="e.g. Professional Classic" /></div>
      <label class="template-active-control"><input v-model="form.is_active" type="checkbox" /><span><strong>Active template</strong><small>Available in marksheet generation</small></span></label>
      <div v-if="isEdit" class="catalog-editor-field template-id-field"><label>Template ID</label><input :value="form._id" type="text" class="form-control" readonly /></div>
    </div>
    <div class="marksheet-editor-workspace">
      <div class="marksheet-editor-main">
        <div v-if="editorMode === 'code'" class="marksheet-editor-canvas"><div class="marksheet-visual-toolbar marksheet-code-toolbar"><button type="button" class="marksheet-inline-code-button" title="Switch to visual editor" @click="setEditorMode('visual')"><i class="fa-solid fa-pen"></i>Visual Editor</button></div><textarea ref="editorElement" v-model="form.html_content" id="html_editor" aria-label="Template HTML source" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off"></textarea></div>
        <div v-else class="marksheet-visual-editor">
          <div class="marksheet-visual-toolbar" role="toolbar" aria-label="Text formatting">
            <button type="button" title="Bold" aria-label="Bold" @mousedown.prevent="formatVisualText('bold')"><strong>B</strong></button>
            <button type="button" title="Italic" aria-label="Italic" @mousedown.prevent="formatVisualText('italic')"><em>I</em></button>
            <button type="button" title="Underline" aria-label="Underline" @mousedown.prevent="formatVisualText('underline')"><u>U</u></button>
            <span class="marksheet-visual-toolbar-divider"></span>
            <label class="marksheet-font-size-control">Font size<select v-model="visualFontSize" aria-label="Font size" @change="setVisualFontSize(visualFontSize)"><option v-for="size in [10, 12, 14, 16, 18, 20, 24, 28, 32, 36]" :key="size" :value="String(size)">{{ size }} px</option></select></label>
            <span class="marksheet-visual-toolbar-divider"></span>
            <button type="button" title="Align left" aria-label="Align left" @mousedown.prevent="alignVisualText('Left')"><i class="fa-solid fa-align-left"></i></button>
            <button type="button" title="Align center" aria-label="Align center" @mousedown.prevent="alignVisualText('Center')"><i class="fa-solid fa-align-center"></i></button>
            <button type="button" title="Align right" aria-label="Align right" @mousedown.prevent="alignVisualText('Right')"><i class="fa-solid fa-align-right"></i></button>
            <span class="marksheet-visual-toolbar-divider"></span>
            <label class="marksheet-table-size-control">Rows<input v-model.number="tableRows" type="number" min="1" max="20" aria-label="Table rows" /></label>
            <label class="marksheet-table-size-control">Columns<input v-model.number="tableColumns" type="number" min="1" max="12" aria-label="Table columns" /></label>
            <button type="button" class="marksheet-insert-table-button" title="Insert table at cursor" @mousedown.prevent="insertVisualTable"><i class="fa-solid fa-table-cells"></i>Table</button>
            <button type="button" class="marksheet-inline-code-button" title="Switch to HTML source" @click="setEditorMode('code')"><i class="fa-solid fa-code"></i>&lt;&gt; Code</button>
          </div>
          <iframe :key="visualDocument" ref="visualEditorFrame" :srcdoc="visualDocument" sandbox="allow-same-origin" title="Editable visual marksheet template" @load="enableVisualEditing"></iframe>
          <p>Click text in the template to edit it. Select text before using formatting controls.</p>
        </div>
      </div>
      <aside class="marksheet-entity-picker" aria-label="Template data fields">
        <div class="marksheet-entity-picker-heading"><i class="fa-solid fa-database"></i><div><strong>Data entities</strong><small>Choose fields to insert dynamic values</small></div></div>
        <label class="marksheet-entity-select-label" for="marksheetEntitySelect">Entity</label>
        <select id="marksheetEntitySelect" v-model="selectedEntity" class="form-select" :disabled="!entityCatalog.length">
          <option v-for="entity in entityCatalog" :key="entity.key" :value="entity.key">{{ entity.label }}</option>
        </select>
        <p class="marksheet-entity-help">Select a field to save it with this template and insert its placeholder into the HTML.</p>
        <div v-if="entityFields.length" class="marksheet-entity-field-list">
          <button v-for="field in entityFields" :key="field.key" type="button" class="marksheet-entity-field" @click="insertEntityField(selectedEntity, field)">
            <span><strong>{{ field.label }}</strong><code>{{ entityPlaceholder(selectedEntity, field.key) }}</code></span>
            <i :class="isEntityFieldSelected(selectedEntity, field.key) ? 'fa-solid fa-check' : 'fa-solid fa-plus'"></i>
          </button>
        </div>
        <p v-else class="marksheet-entity-empty">Choose an entity to see its available fields.</p>
        <p class="marksheet-entity-footnote"><i class="fa-solid fa-shield-halved"></i> Only selected fields are resolved from this school's marksheet data.</p>
      </aside>
    </div>
  </section>
</section>
`;
