import { api } from '../../../Services/api.js'
import template from './SupportTicketDetailTemplate.js'
const { ref, reactive, onMounted, computed } = Vue
const { useRoute, useRouter } = VueRouter

export default {
  name: 'SupportTicketDetail',
  template,
  setup() {
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
        const response = await api.get(`/support-tickets/${route.params.id}`)
        if (response.data && response.data.success) {
          ticket.value = response.data.data.ticket
          messages.value = response.data.data.messages || []
        } else {
          error.value = response.data?.message || 'Failed to load ticket'
        }
      } catch (e) {
        error.value = e.response?.data?.message || e.message || 'Failed to load ticket'
      } finally {
        loading.value = false
      }
    }

    const submitReply = async () => {
      if (!replyText.value.trim()) return
      submitting.value = true
      try {
        const response = await api.post(`/support-tickets/${route.params.id}/replies`, {
          message: replyText.value.trim()
        })
        if (response.data && response.data.success) {
          messages.value.push(response.data.data)
          replyText.value = ''
          toast?.success?.('Reply sent')
        } else {
          toast?.error?.(response.data?.message || 'Failed to send reply')
        }
      } catch (e) {
        toast?.error?.(e.response?.data?.message || 'Failed to send reply')
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

    const goBack = () => {
      router.push('/support/tickets')
    }

    const isResolved = computed(() => {
      return ticket.value?.status?.code === 'resolved'
    })

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
      goBack,
      isResolved,
    }
  }
}