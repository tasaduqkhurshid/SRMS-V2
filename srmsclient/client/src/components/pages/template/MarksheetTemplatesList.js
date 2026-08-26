import { api } from '../../../Services/api.js';
import template from './MarksheetTemplatesListTemplate.js'
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
        console.error('Error fetching templates:', error)
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
        console.error('Error deleting template:', error)
        toast?.error?.('Error deleting template')
      }
    }

    // Edit template
    const editTemplate = (id) => {
      router.push(`/templates/marksheets/${id}/edit`)
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
        console.error('Error updating template:', error)
        toast?.error?.('Error updating template')
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
      addTemplate,
      searchTemplates,
      resetSearch,
      toggleActive,
      goToPage,
      totalPages
    }
  }
}
