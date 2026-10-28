import { api } from '../../../Services/api.js';
import template from './MarksheetTemplatesListTemplate.js'
import { renderMarksheetTemplatePreview } from './marksheetPreview.js'
const { ref, onMounted } = Vue
const { useRouter } = VueRouter

export default {
  name: 'MarksheetTemplatesList',
  template,
  setup() {
    const router = useRouter()

    const templates = ref([])
    const search = ref('')
    const page = ref(1)
    const limit = ref(50)
    const totalRecords = ref(0)
    const loading = ref(false)
    const previewing = ref(false)
    const previewName = ref('')
    const previewHtml = ref('')

    // Fetch templates
    const fetchTemplates = async () => {
      loading.value = true
      try {
        const params = new URLSearchParams()
        if (search.value) params.append('q', search.value)
        params.append('page', page.value)
        params.append('limit', limit.value)

        const response = await api.get(`/marksheet-templates?${params.toString()}`)
        if (response.data && response.data.data) {
          templates.value = response.data.data.templates || []
          if (response.data.data.meta) {
            totalRecords.value = response.data.data.meta.total || 0
          }
        }
      } catch (error) {
        templates.value = []
        totalRecords.value = 0
        toast?.error?.(error.response?.data?.message || 'Could not load marksheet templates')
      } finally {
        loading.value = false
      }
    }

    // Delete template
    const deleteTemplate = async (id) => {
      if (!confirm('Are you sure you want to delete this template?')) return

      try {
        await api.delete(`/marksheet-templates/${id}`)
        toast?.success?.('Template deleted successfully')
        fetchTemplates()
      } catch (error) {
        toast?.error?.(error.response?.data?.message || 'Error deleting template')
      }
    }

    // Edit template
    const editTemplate = (id) => {
      router.push(`/templates/marksheets/${id}/edit`)
    }

    const viewTemplate = async (id) => {
      previewing.value = true
      previewName.value = 'Loading template…'
      previewHtml.value = ''
      try {
        const response = await api.get(`/marksheet-templates/${id}`)
        const savedTemplate = response.data?.data
        if (!savedTemplate?.html_content) throw new Error('Template HTML is empty')
        previewName.value = savedTemplate.name || 'Marksheet template'
        previewHtml.value = renderMarksheetTemplatePreview(savedTemplate.html_content)
      } catch (error) {
        previewing.value = false
        toast?.error?.(error.response?.data?.message || error.message || 'Could not load template preview')
      }
    }

    // Add new template
    const addTemplate = () => {
      router.push('/templates/marksheets/add')
    }

    // Search
    const searchTemplates = () => {
      page.value = 1
      fetchTemplates()
    }

    // Reset search
    const resetSearch = () => {
      search.value = ''
      page.value = 1
      fetchTemplates()
    }

    // Toggle active status
    const toggleActive = async (template) => {
      try {
        const updated = await api.post(`/marksheet-templates/save`, {
          _id: template._id,
          is_active: !template.is_active
        })
        toast?.success?.('Template updated successfully')
        fetchTemplates()
      } catch (error) {
        toast?.error?.(error.response?.data?.message || 'Error updating template')
      }
    }

    const goToPage = (p) => {
      page.value = p
      fetchTemplates()
    }

    const totalPages = () => {
      return Math.ceil(totalRecords.value / limit.value)
    }

    onMounted(() => {
      fetchTemplates()
    })

    return {
      templates,
      search,
      page,
      totalRecords,
      loading,
      fetchTemplates,
      deleteTemplate,
      editTemplate,
      viewTemplate,
      previewing,
      previewName,
      previewHtml,
      addTemplate,
      searchTemplates,
      resetSearch,
      toggleActive,
      goToPage,
      totalPages
    }
  }
}
