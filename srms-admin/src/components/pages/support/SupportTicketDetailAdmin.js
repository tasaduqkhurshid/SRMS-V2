import template from './SupportTicketDetailAdminTemplate.js'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'SupportTicketDetailAdmin',
  props: {
    api: { type: Function, required: true },
    ticketId: { type: String, required: true },
    schools: { type: Array, required: true },
    subjects: { type: Array, required: true },
    services: { type: Array, required: true },
    statuses: { type: Array, required: true },
    currentUser: { type: Object, required: true },
  },
  emits: ['back', 'updated'],
  template,
  setup(props, { emit }) {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(true)
    const submitting = ref(false)
    const error = ref('')
    const ticket = ref(null)
    const messages = ref([])
    const replyText = ref('')

    const fetchTicket = async () => {
      loading.value = true
      error.value = ''
      try {
        const response = await props.api(`/support-tickets/${props.ticketId}`, {
          params: { include_internal: 'true' }
        })
        if (response && response.ticket) {
          const t = response.ticket
          ticket.value = {
            ...t,
            subject: t.subject_id,
            service: t.service_id,
            status: t.status_id,
          }
          messages.value = response.messages || []
        } else {
          error.value = response?.message || 'Failed to load ticket'
        }
      } catch (e) {
        error.value = e.message || 'Failed to load ticket'
      } finally {
        loading.value = false
      }
    }

    const submitReply = async () => {
      if (!replyText.value.trim()) return
      submitting.value = true
      try {
        const response = await props.api(`/support-tickets/${props.ticketId}/replies`, {
          method: 'POST',
          body: JSON.stringify({
            message: replyText.value.trim(),
            message_type: 'reply',
          }),
        })
        if (response) {
          messages.value.push(response)
          replyText.value = ''
        }
      } catch (e) {
        alert(e.message || 'Failed to send reply')
      } finally {
        submitting.value = false
      }
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return '—'
      try {
        return new Date(dateString).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      } catch {
        return dateString
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return '—'
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      } catch {
        return dateString
      }
    }

    const getStatusBadgeClass = (statusCode) => {
      const classes = {
        'pending': 'badge-pending',
        'awaiting': 'badge-awaiting',
        'underwriting': 'badge-underwriting',
        'resolved': 'badge-resolved',
      }
      return classes[statusCode] || 'badge-secondary'
    }

    const getPriorityBadgeClass = (priority) => {
      const classes = {
        'low': 'badge-low',
        'medium': 'badge-medium',
        'high': 'badge-high',
        'urgent': 'badge-urgent',
      }
      return classes[priority] || 'badge-secondary'
    }

    const getMessageTypeClass = (type) => {
      const classes = {
        'reply': 'message-reply',
        'system_activity': 'message-system',
      }
      return classes[type] || 'message-reply'
    }

    const getSenderBadgeClass = (portal) => {
      return portal === 'admin' ? 'badge-admin' : 'badge-school'
    }

    const isResolved = computed(() => {
      return ticket.value?.status?.code === 'resolved'
    })

    const goBack = () => {
      emit('back')
    }

    onMounted(() => {
      fetchTicket()
    })

    return {
      loading,
      submitting,
      error,
      ticket,
      messages,
      replyText,
      submitReply,
      formatDateTime,
      formatDate,
      getStatusBadgeClass,
      getPriorityBadgeClass,
      getMessageTypeClass,
      getSenderBadgeClass,
      isResolved,
      goBack,
      statuses: props.statuses,
    }
  },
}
