import { api } from '../../../Services/api.js'
import template from './CreateSupportTicketTemplate.js'
const { ref, reactive, onMounted, watch } = Vue
const { useRouter } = VueRouter

export default {
  name: 'CreateSupportTicket',
  template,
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const saving = ref(false)
    const error = ref('')
    const success = ref('')
    const subjects = ref([])
    const services = ref([])
    const statuses = ref([])

    const form = reactive({
      subject_id: '',
      service_id: '',
      module: '',
      title: '',
      description: '',
      priority: 'medium',
    })

    const attachments = ref([])
    const attachmentFiles = ref([])

    const fetchOptions = async () => {
      try {
        const [subjectsRes, servicesRes] = await Promise.all([
          api.get('/support-ticket-subjects'),
          api.get('/support-ticket-services'),
        ])
        subjects.value = subjectsRes.data?.data || []
        services.value = servicesRes.data?.data || []
      } catch (e) {
        error.value = 'Failed to load form options'
        console.error(e)
      }
    }

    const handleFileChange = (event) => {
      const files = Array.from(event.target.files)
      const validFiles = files.filter(file => {
        const allowedTypes = [
          'image/jpeg', 'image/png', 'image/webp', 'image/gif',
          'application/pdf',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]
        if (!allowedTypes.includes(file.type)) {
          toast?.error?.(`${file.name}: Invalid file type`)
          return false
        }
        if (file.size > 10 * 1024 * 1024) {
          toast?.error?.(`${file.name}: File too large (max 10MB)`)
          return false
        }
        return true
      })

      if (attachmentFiles.value.length + validFiles.length > 5) {
        toast?.error?.('Maximum 5 attachments allowed')
        validFiles.length = Math.max(0, 5 - attachmentFiles.value.length)
      }

      attachmentFiles.value.push(...validFiles)
      attachments.value = attachmentFiles.value.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
      }))
      event.target.value = ''
    }

    const removeAttachment = (index) => {
      attachmentFiles.value.splice(index, 1)
      attachments.value.splice(index, 1)
    }

    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const validateForm = () => {
      if (!form.subject_id) {
        error.value = 'Please select a subject'
        return false
      }
      if (!form.title.trim()) {
        error.value = 'Please enter a title'
        return false
      }
      if (!form.description.trim()) {
        error.value = 'Please enter a description'
        return false
      }
      return true
    }

    const submitTicket = async () => {
      if (!validateForm()) return

      saving.value = true
      error.value = ''
      success.value = ''

      try {
        const formData = new FormData()
        formData.append('subject_id', form.subject_id)
        if (form.service_id) formData.append('service_id', form.service_id)
        if (form.module) formData.append('module', form.module)
        formData.append('title', form.title.trim())
        formData.append('description', form.description.trim())
        formData.append('priority', form.priority)
        attachmentFiles.value.forEach(file => {
          formData.append('attachments', file)
        })

        const response = await api.post('/support-tickets', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        if (response.data && response.data.success) {
          success.value = `Ticket created successfully! Ticket #: ${response.data.data.ticket_number}`
          toast?.success?.(success.value)
          setTimeout(() => {
            router.push(`/support/tickets/${response.data.data._id}`)
          }, 1500)
        } else {
          error.value = response.data?.message || 'Failed to create ticket'
        }
      } catch (e) {
        error.value = e.response?.data?.message || e.message || 'Failed to create ticket'
        toast?.error?.(error.value)
      } finally {
        saving.value = false
      }
    }

    const goBack = () => {
      router.push('/support/tickets')
    }

    onMounted(() => {
      fetchOptions()
    })

    return {
      loading,
      saving,
      error,
      success,
      form,
      subjects,
      services,
      attachments,
      attachmentFiles,
      handleFileChange,
      removeAttachment,
      formatFileSize,
      submitTicket,
      goBack,
    }
  }
}