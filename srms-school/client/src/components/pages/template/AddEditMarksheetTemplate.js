import template from './AddEditMarksheetTemplateTemplate.js'
import { api } from '../../../Services/api.js';
const { ref, onMounted, onUnmounted, computed } = Vue
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
      is_active: true
    })

    const loading = ref(false)
    const saving = ref(false)
    const showPreview = ref(false)
    const editorMode = ref('code') // 'code' or 'preview'
    let htmlEditor = null

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
            _id: response.data.data._id
          }
        }
      } catch (error) {
        toast?.error?.(error.response?.data?.message || 'Error loading template')
      } finally {
        loading.value = false
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
          is_active: form.value.is_active
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

    // Insert placeholder
    const insertPlaceholder = (placeholder) => {
      form.value.html_content += placeholder
      if (htmlEditor) htmlEditor.html.set(form.value.html_content)
    }

    // Common placeholders
    const placeholders = [
      { text: 'Student Name', value: '{{student_name}}' },
      { text: 'Roll Number', value: '{{roll_number}}' },
      { text: 'Exam Name', value: '{{exam_name}}' },
      { text: 'Course/Class', value: '{{class}}' },
      { text: 'Academic Year', value: '{{session}}' },
      { text: 'School Name', value: '{{school_name}}' },
      { text: 'Current Date', value: '{{current_date}}' },
      { text: 'School Logo', value: '{{school_logo}}' },
      { text: 'Marks Matrix', value: '{{marks_matrix}}' },
      { text: 'Remarks Matrix', value: '{{remarks_matrix}}' },
      { text: 'Total Marks', value: '{{total_marks}}' },
      { text: 'Maximum Marks', value: '{{max_marks}}' },
      { text: 'Date', value: '{{date}}' }
    ]

    const insertSampleMarksheet = () => {
      form.value.html_content = `
<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
  <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #000; padding-bottom: 15px;">
    <img src="{{school_logo}}" alt="School logo" style="max-height: 80px; max-width: 160px; object-fit: contain;" />
    <h2 style="margin: 0;">{{school_name}}</h2>
    <h3 style="margin: 5px 0 0 0; color: #666;">MARKSHEET</h3>
  </div>

  <div style="margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
    <div><strong>Student Name:</strong> {{student_name}}</div>
    <div><strong>Roll Number:</strong> {{roll_number}}</div>
    <div><strong>Class:</strong> {{class}}</div>
    <div><strong>Academic Year:</strong> {{session}}</div>
    <div><strong>Exam:</strong> {{exam_name}}</div>
    <div><strong>Date:</strong> {{current_date}}</div>
  </div>

  <div style="margin: 20px 0;">{{marks_matrix}}</div>

  <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; font-size: 14px;">
    <div><strong>Overall Total Marks:</strong> {{total_marks}} / {{max_marks}}</div>
    <div style="margin-top: 10px;">{{remarks_matrix}}</div>
  </div>

  <div style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 12px;">
    <div>___________________<br/>Teacher Signature</div>
    <div>___________________<br/>Principal Signature</div>
  </div>
</div>
      `
      if (htmlEditor) htmlEditor.html.set(form.value.html_content)
    }

    onMounted(async () => {
      if (isEdit.value) await fetchTemplate()
      await Vue.nextTick()
      htmlEditor = new FroalaEditor('#html_editor', {
          heightMin: 420,
          heightMax: 560,
          toolbarButtons: [
            'bold', 'italic', 'underline', 'strikethrough', '|',
            'formatOL', 'formatUL', '|',
            'align', 'indent', 'outdent', '|',
            'insertTable', '|',
            'createLink', 'insertImage', '|',
            'undo', 'redo', '|',
            'html'
          ],
          codeMirror: true,
          codeMirrorOptions: {
            indentType: 'tab',
            tabSize: 2
          }
        })
        if (form.value.html_content) htmlEditor.html.set(form.value.html_content)
        htmlEditor.events.on('contentChanged', function() {
          form.value.html_content = this.html.get()
        })
    })

    onUnmounted(() => { if (htmlEditor) { htmlEditor.destroy(); htmlEditor = null } })

    return {
      form,
      loading,
      saving,
      showPreview,
      editorMode,
      isEdit,
      saveTemplate,
      insertPlaceholder,
      placeholders,
      insertSampleMarksheet,
      router
    }
  }
}
