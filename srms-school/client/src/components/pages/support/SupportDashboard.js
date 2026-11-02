import { api } from '../../../Services/api.js'
import template from './SupportDashboardTemplate.js'
const { ref, reactive, onMounted, computed } = Vue
const { useRouter } = VueRouter

export default {
  name: "SupportDashboardPage",
  template,
  setup() {
    const router = useRouter()
    const stats = reactive({
      total: 0,
      pending: 0,
      awaiting: 0,
      underwriting: 0,
      resolved: 0,
    })

    const recentTickets = ref([])
    const loading = ref(true)

    const fetchStats = async () => {
      try {
        const response = await api.get('/support-tickets/statistics')
        if (response.data && response.data.data) {
          const data = response.data.data
          stats.total = data.total || 0
          stats.pending = data.by_status?.pending?.count || 0
          stats.awaiting = data.by_status?.awaiting?.count || 0
          stats.underwriting = data.by_status?.underwriting?.count || 0
          stats.resolved = data.by_status?.resolved?.count || 0
        }

        // Get recent tickets
        const ticketsResponse = await api.get('/support-tickets', { 
          params: { limit: 5, sort_by: 'created_at', sort_direction: 'desc' }
        })
        recentTickets.value = ticketsResponse.data?.data?.tickets || []
      } catch (error) {
        console.error('Error fetching support dashboard stats:', error)
      } finally {
        loading.value = false
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

    const goToTicket = (ticketId) => {
      router.push(`/support/tickets/${ticketId}`)
    }

    onMounted(() => {
      fetchStats()
    })

    return {
      stats,
      recentTickets,
      loading,
      formatDate,
      getStatusBadgeClass,
      getPriorityBadgeClass,
      goToTicket,
    }
  }
}