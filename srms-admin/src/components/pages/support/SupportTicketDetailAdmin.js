import template from './SupportTicketDetailAdminTemplate.js'
import { ref, reactive, computed, onMounted } from 'vue'
const { useRoute, useRouter } = VueRouter

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
    const replyType = ref('reply') // 'reply' or 'internal_note'
    const showStatusModal = ref(false)
    const selectedStatusId = ref('')

    const fetchTicket = async () => {
      loading.value = true
      error.value = ''
      try {
        const response = await props.api(`/support-tickets/${props.ticketId}`, { 
          params: { include_internal: 'true' } 
        })
        if (response && response.ticket) {
          ticket.value = response.ticket
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
            message_type: replyType.value,
          }),
        })
        if (response) {
          messages.value.push(response)
          replyText.value = ''
          alert(replyType.value === 'internal_note' ? 'Internal note added' : 'Reply sent')
        }
      } catch (e) {
        alert(e.message || 'Failed to send reply')
      } finally {
        submitting.value = false
      }
    }

    const changeStatus = async () => {
      if (!selectedStatusId.value) return
      try {
        const response = await props.api(`/support-tickets/${props.ticketId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status_id: selectedStatusId.value }),
        })
        if (response) {
          ticket.value.status = response.newStatus || ticket.value.status
          ticket.value.status_id = selectedStatusId.value
          ticket.value.updated_at = new Date().toISOString()
          messages.value.push({
            message_type: 'system_activity',
            message: 'Status changed to "' + (response.newStatus?.name || 'Unknown') + '"',
            created_at: new Date().toISOString(),
            sender_name: props.currentUser.username,
            sender_role: props.currentUser.role,
            sender_portal: 'admin',
          })
          showStatusModal.value = false
          selectedStatusId.value = ''
          alert('Status updated')
        }
      } catch (e) {
        alert(e.message || 'Failed to change status')
      }
    }

    const resolveTicket = async () => {
      if (!confirm('Are you sure you want to resolve this ticket?')) return
      try {
        const response = await props.api(`/support-tickets/${props.ticketId}/resolve`, {
          method: 'POST',
        })
        if (response) {
          ticket.value.status = { code: 'resolved', name: 'Resolved', color: '#10B981' }
          ticket.value.status_id = ticket.value.status._id
          ticket.value.resolved_at = new Date().toISOString()
          ticket.value.updated_at = new Date().toISOString()
          messages.value.push({
            message_type: 'system_activity',
            message: 'Ticket resolved',
            created_at: new Date().toISOString(),
            sender_name: props.currentUser.username,
            sender_role: props.currentUser.role,
            sender_portal: 'admin',
          })
          alert('Ticket resolved')
        }
      } catch (e) {
        alert(e.message || 'Failed to resolve ticket')
      }
    }

    const reopenTicket = async () => {
      if (!confirm('Are you sure you want to reopen this ticket?')) return
      try {
        const response = await props.api(`/support-tickets/${props.ticketId}/reopen`, {
          method: 'POST',
        })
        if (response) {
          ticket.value.status = { code: 'pending', name: 'Pending', color: '#F59E0B' }
          ticket.value.status_id = ticket.value.status._id
          ticket.value.resolved_at = null
          ticket.value.updated_at = new Date().toISOString()
          messages.value.push({
            message_type: 'system_activity',
            message: 'Ticket reopened',
            created_at: new Date().toISOString(),
            sender_name: props.currentUser.username,
            sender_role: props.currentUser.role,
            sender_portal: 'admin',
          })
          alert('Ticket reopened')
        }
      } catch (e) {
        alert(e.message || 'Failed to reopen ticket')
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
        'internal_note': 'message-internal',
        'system_activity': 'message-system',
      }
      return classes[type] || 'message-reply'
    }

    const getSenderBadgeClass = (portal) => {
      return portal === 'admin' ? 'badge-admin' : 'badge-school'
    }

    const openStatusModal = () => {
      if (ticket.value?.status_id) {
        selectedStatusId.value = ticket.value.status_id
      }
      showStatusModal.value = true
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
      replyType,
      showStatusModal,
      selectedStatusId,
      submitReply,
      changeStatus,
      resolveTicket,
      reopenTicket,
      formatDateTime,
      formatDate,
      getStatusBadgeClass,
      getPriorityBadgeClass,
      getMessageTypeClass,
      getSenderBadgeClass,
      openStatusModal,
      isResolved,
      goBack,
      statuses: props.statuses,
    }
  },
}