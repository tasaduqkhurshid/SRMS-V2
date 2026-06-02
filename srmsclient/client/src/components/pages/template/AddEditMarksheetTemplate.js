import template from './AddEditMarksheetTemplateTemplate.js'
import { api } from '../../../Services/api.js';
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
      is_active: true
    })

    const loading = ref(false)
    const saving = ref(false)
    const showPreview = ref(false)
    const editorMode = ref('code') // 'code' or 'preview'

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
            id: response.data.data.id
          }
        }
      } catch (error) {
        console.error('Error fetching template:', error)
        toast?.error?.('Error loading template')
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
          payload.id = templateId.value
        }

        const response = await api.post('/marksheet-templates/save', payload)
        toast?.success?.(isEdit.value ? 'Template updated successfully' : 'Template created successfully')
        router.push('/templates/marksheets')
      } catch (error) {
        console.error('Error saving template:', error)
        toast?.error?.('Error saving template')
      } finally {
        saving.value = false
      }
    }

    // Insert placeholder
    const insertPlaceholder = (placeholder) => {
      // Insert at cursor position or end of content
      form.value.html_content += placeholder
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
      { text: 'Marks Rows', value: '{{marks_rows}}' },
      { text: 'Overall Total', value: '{{overall_total}}' },
      { text: 'Overall Grade', value: '{{overall_grade}}' },
      { text: 'Total Theory', value: '{{total_theory}}' },
      { text: 'Total Lab', value: '{{total_lab}}' },
      { text: 'Total Attendance', value: '{{total_attendance}}' },
      { text: 'Total Activity', value: '{{total_activity}}' },
      { text: 'Remarks', value: '{{remarks}}' }
    ]

    const insertSampleMarksheet = () => {
      form.value.html_content = `
<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
  <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #000; padding-bottom: 15px;">
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

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
    <thead>
      <tr style="background-color: #f0f0f0; border: 1px solid #ddd;">
        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Subject</th>
        <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Theory</th>
        <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Lab</th>
        <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Attendance</th>
        <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Activity</th>
        <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Total</th>
      </tr>
    </thead>
    <tbody>
      {{marks_rows}}
    </tbody>
  </table>

  <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; font-size: 14px;">
    <div><strong>Overall Total Marks:</strong> {{overall_total}}</div>
    <div><strong>Overall Grade:</strong> {{overall_grade}}</div>
    <div style="margin-top: 10px;">Remarks: {{remarks}}</div>
  </div>

  <div style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 12px;">
    <div>___________________<br/>Teacher Signature</div>
    <div>___________________<br/>Principal Signature</div>
  </div>
</div>
      `
    }

    onMounted(() => {
      if (isEdit.value) {
        fetchTemplate()
      }
      
      // Initialize Froala Editor
      setTimeout(() => {
        const editor = new FroalaEditor('#html_editor', {
          heightMin: 350,
          heightMax: 350,
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
        
        // Set initial content if editing
        if (isEdit.value && form.value.html_content) {
          editor.html.set(form.value.html_content)
        }
        
        // Update form.html_content when editor changes
        editor.events.on('contentChanged', function() {
          form.value.html_content = this.html.get()
        })
      }, 100)
    })

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
