import template from './AddEditMarksheetTemplateTemplate.js'
import { api } from '../../../Services/api.js';
import { sampleMarksTable } from './marksheetPreview.js'
const { ref, onMounted, computed } = Vue
const { useRoute, useRouter } = VueRouter

export default {
  name: 'AddEditMarksheetTemplate',
  template,
  setup() {
    const route = useRoute()
    const router = useRouter()

    const isEdit = computed(() => route.params.id !== undefined)
    const templateId = computed(() => route.params.id)

    const form = ref({
      name: '',
      html_content: '',
      is_active: true,
      entities: []
    })

    const entityCatalog = ref([])
    const selectedEntity = ref('')
    const editorElement = ref(null)
    const visualEditorFrame = ref(null)
    const visualFontSize = ref('14')
    const tableRows = ref(3)
    const tableColumns = ref(3)
    const selectedEntityDefinition = computed(() => entityCatalog.value.find(entity => entity.key === selectedEntity.value) || null)
    const entityFields = computed(() => selectedEntityDefinition.value?.fields || [])
    const visualDocument = ref('')

    const loading = ref(false)
    const saving = ref(false)
    const editorMode = ref('visual')
    let savedVisualRange = null

    const buildVisualDocument = (source = '') => {
      const html = String(source || '').replace(/\{\{marks_table\}\}/gi, `<div data-template-placeholder="marks_table" contenteditable="false">${sampleMarksTable}</div>`)
      if (/<html(?:\s|>)/i.test(html)) return html
      const styles = []
      const body = html.replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, (styleTag) => {
        styles.push(styleTag)
        return ''
      })
      return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{min-height:100%;}body{margin:0;padding:0;background:#eef2f7;}</style>${styles.join('\n')}</head><body>${body}</body></html>`
    }

    // Fetch template if editing
    const fetchTemplate = async () => {
      loading.value = true
      try {
        const response = await api.get(`/marksheet-templates/${templateId.value}`)
        if (response.data && response.data.data) {
          form.value = {
            name: response.data.data.name,
            html_content: response.data.data.html_content,
            is_active: response.data.data.is_active,
            entities: Array.isArray(response.data.data.entities) ? response.data.data.entities : [],
            _id: response.data.data._id
          }
        }
      } catch (error) {
        toast?.error?.(error.response?.data?.message || 'Error loading template')
      } finally {
        loading.value = false
      }
    }

    const fetchEntityCatalog = async () => {
      try {
        const response = await api.get('/marksheet-templates/entities')
        entityCatalog.value = response.data?.data || []
        if (!selectedEntity.value) selectedEntity.value = entityCatalog.value[0]?.key || ''
      } catch (error) {
        toast?.error?.(error.response?.data?.message || 'Could not load template entities')
      }
    }

    // Save template
    const saveTemplate = async () => {
      if (!form.value.name || !form.value.html_content) {
        toast?.error?.('Please fill in all required fields')
        return
      }

      saving.value = true
      try {
        const payload = {
          name: form.value.name,
          html_content: form.value.html_content,
          is_active: form.value.is_active,
          entities: form.value.entities
        }

        if (isEdit.value) {
          payload._id = templateId.value
        }

        const response = await api.post('/marksheet-templates/save', payload)
        if (response.data?.status !== 'success' && !response.data?.success) throw new Error(response.data?.message || 'Could not save template')
        toast?.success?.(isEdit.value ? 'Template updated successfully' : 'Template created successfully')
        router.push('/templates/marksheets')
      } catch (error) {
        toast?.error?.(error.response?.data?.message || error.message || 'Error saving template')
      } finally {
        saving.value = false
      }
    }

    const setEditorMode = (mode) => {
      if (mode === editorMode.value) return
      if (mode === 'visual') {
        visualDocument.value = buildVisualDocument(form.value.html_content)
        savedVisualRange = null
        editorMode.value = 'visual'
        return
      }
      syncVisualHtml()
      editorMode.value = 'code'
    }

    const visualLogoPlaceholder = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#fff" stroke="#c99a37" stroke-width="5"/><path d="M50 18 71 28v20c0 17-10 28-21 34C39 76 29 65 29 48V28z" fill="#15345e"/><text x="50" y="56" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#fff">S</text></svg>')}`

    const setVisualImages = (doc) => {
      doc.querySelectorAll('img[data-template-original-src]').forEach((image) => {
        image.setAttribute('src', visualLogoPlaceholder)
      })
      doc.querySelectorAll('img').forEach((image) => {
        const src = image.getAttribute('src') || ''
        if (src.includes('{{') && !image.hasAttribute('data-template-original-src')) {
          image.setAttribute('data-template-original-src', src)
          image.setAttribute('src', visualLogoPlaceholder)
        }
      })
    }

    const syncVisualHtml = () => {
      const doc = visualEditorFrame.value?.contentDocument
      if (!doc?.documentElement || !doc.body) return
      const body = doc.body
      body.removeAttribute('contenteditable')
      body.removeAttribute('data-visual-editor')
      body.removeAttribute('spellcheck')
      const zoomStyle = doc.querySelector('style[data-visual-editor-zoom]')
      zoomStyle?.remove()
      const sampleTableMarkers = [...doc.querySelectorAll('[data-template-placeholder="marks_table"]')].map(node => {
        const marker = doc.createTextNode('{{marks_table}}')
        node.replaceWith(marker)
        return { node, marker }
      })
      const images = [...doc.querySelectorAll('img[data-template-original-src]')]
      images.forEach((image) => {
        image.setAttribute('src', image.getAttribute('data-template-original-src'))
        image.removeAttribute('data-template-original-src')
      })
      const serialized = `<!doctype html>${doc.documentElement.outerHTML}`
      form.value.html_content = serialized
      sampleTableMarkers.forEach(({ node, marker }) => marker.replaceWith(node))
      body.setAttribute('contenteditable', 'true')
      body.setAttribute('data-visual-editor', 'true')
      if (zoomStyle) doc.head.appendChild(zoomStyle)
      setVisualImages(doc)
    }

    const enableVisualEditing = () => {
      const doc = visualEditorFrame.value?.contentDocument
      if (!doc?.body) return
      doc.body.setAttribute('contenteditable', 'true')
      doc.body.setAttribute('data-visual-editor', 'true')
      doc.body.setAttribute('spellcheck', 'true')
      if (!doc.querySelector('style[data-visual-editor-zoom]')) {
        const zoomStyle = doc.createElement('style')
        zoomStyle.setAttribute('data-visual-editor-zoom', 'true')
        zoomStyle.textContent = 'html{width:100%;min-height:100%;margin:0!important;overflow-x:auto!important;overflow-y:auto!important;scrollbar-gutter:stable}body{box-sizing:border-box!important;width:100%;min-height:100%;margin:0!important;padding:3px!important;overflow:visible!important;zoom:1.06!important}body>*:not(style){box-sizing:border-box!important;width:100%!important;max-width:none!important;margin:0!important}'
        doc.head.appendChild(zoomStyle)
      }
      setVisualImages(doc)
      doc.addEventListener('selectionchange', () => {
        const selection = doc.getSelection()
        if (selection?.rangeCount && doc.body.contains(selection.getRangeAt(0).commonAncestorContainer)) {
          savedVisualRange = selection.getRangeAt(0).cloneRange()
        }
      })
      doc.body.addEventListener('input', syncVisualHtml)
    }

    const restoreVisualSelection = (doc) => {
      if (!doc?.body) return false
      doc.body.focus()
      const selection = doc.getSelection()
      if (savedVisualRange && doc.body.contains(savedVisualRange.commonAncestorContainer)) {
        selection.removeAllRanges()
        selection.addRange(savedVisualRange)
      }
      return !!selection?.rangeCount
    }

    const formatVisualText = (command) => {
      const doc = visualEditorFrame.value?.contentDocument
      if (!doc?.body) return
      restoreVisualSelection(doc)
      doc.execCommand(command, false)
      syncVisualHtml()
    }

    const alignVisualText = (alignment) => {
      const doc = visualEditorFrame.value?.contentDocument
      if (!restoreVisualSelection(doc)) return
      doc.execCommand(`justify${alignment}`, false)
      syncVisualHtml()
    }

    const setVisualFontSize = (size) => {
      const doc = visualEditorFrame.value?.contentDocument
      if (!restoreVisualSelection(doc)) return
      const selection = doc.getSelection()
      const range = selection.getRangeAt(0)
      if (range.collapsed) return
      const span = doc.createElement('span')
      span.style.fontSize = `${Number(size) || 14}px`
      span.append(range.extractContents())
      range.insertNode(span)
      const updatedRange = doc.createRange()
      updatedRange.selectNodeContents(span)
      selection.removeAllRanges()
      selection.addRange(updatedRange)
      savedVisualRange = updatedRange.cloneRange()
      syncVisualHtml()
    }

    const insertVisualTable = () => {
      const doc = visualEditorFrame.value?.contentDocument
      if (!restoreVisualSelection(doc)) return
      const rows = Math.max(1, Math.min(20, Number(tableRows.value) || 3))
      const columns = Math.max(1, Math.min(12, Number(tableColumns.value) || 3))
      const cells = Array.from({ length: columns }, () => '<td style="border:1px solid #9aa9ba;padding:7px;min-width:50px">&nbsp;</td>').join('')
      const table = `<table style="border-collapse:collapse;width:100%;margin:8px 0"><tbody>${Array.from({ length: rows }, () => `<tr>${cells}</tr>`).join('')}</tbody></table><p><br></p>`
      doc.execCommand('insertHTML', false, table)
      syncVisualHtml()
    }

    // Insert placeholder
    const insertPlaceholder = (placeholder) => {
      if (editorMode.value === 'visual') {
        const doc = visualEditorFrame.value?.contentDocument
        if (doc?.body) {
          doc.body.focus()
          doc.execCommand('insertText', false, placeholder)
          syncVisualHtml()
          return
        }
      }
      const current = form.value.html_content || ''
      const textarea = editorElement.value
      const start = textarea ? textarea.selectionStart : current.length
      const end = textarea ? textarea.selectionEnd : current.length
      form.value.html_content = `${current.slice(0, start)}${placeholder}${current.slice(end)}`
      if (editorMode.value === 'visual') visualDocument.value = buildVisualDocument(form.value.html_content)
      Vue.nextTick(() => {
        if (!textarea || editorMode.value !== 'code') return
        textarea.focus()
        const cursor = start + placeholder.length
        textarea.setSelectionRange(cursor, cursor)
      })
    }

    const isEntityFieldSelected = (entityKey, fieldKey) =>
      form.value.entities.some(selection => selection.entity === entityKey && selection.fields.includes(fieldKey))

    const insertEntityField = (entityKey, field) => {
      let selection = form.value.entities.find(item => item.entity === entityKey)
      if (!selection) {
        selection = { entity: entityKey, fields: [] }
        form.value.entities.push(selection)
      }
      if (!selection.fields.includes(field.key)) selection.fields.push(field.key)
      insertPlaceholder(`{{${entityKey}.${field.key}}}`)
    }

    const entityPlaceholder = (entityKey, fieldKey) => `{{${entityKey}.${fieldKey}}}`

    onMounted(async () => {
      await Promise.all([fetchEntityCatalog(), isEdit.value ? fetchTemplate() : Promise.resolve()])
      if (editorMode.value === 'visual') visualDocument.value = buildVisualDocument(form.value.html_content)
    })

    return {
      form,
      entityCatalog,
      selectedEntity,
      selectedEntityDefinition,
      entityFields,
      editorElement,
      visualEditorFrame,
      visualDocument,
      visualFontSize,
      tableRows,
      tableColumns,
      enableVisualEditing,
      formatVisualText,
      alignVisualText,
      setVisualFontSize,
      insertVisualTable,
      isEntityFieldSelected,
      insertEntityField,
      entityPlaceholder,
      loading,
      saving,
      editorMode,
      isEdit,
      saveTemplate,
      setEditorMode,
      insertPlaceholder,
      router
    }
  }
}
