import { api } from '../../../Services/api.js'
import template from './SupportTicketListTemplate.js'
const { ref, computed, onMounted, watch } = Vue
const { useRoute, useRouter } = VueRouter

export default {
  name: 'SupportTicketList',
  template,
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const tickets = ref([])
    const subjects = ref([])
    const services = ref([])
    const statuses = ref([])
    const total = ref(0)
    const meta = ref({ page: 1, limit: 20, total: 0, pages: 1 })

    const searchTerm = ref('')
    const statusFilter = ref('')
    const subjectFilter = ref('')
    const serviceFilter = ref('')
    const priorityFilter = ref('')
    const dateFrom = ref('')
    const dateTo = ref('')
    const sortKey = ref('created_at')
    const sortDirection = ref('desc')
    const page = ref(1)
    const pageSize = ref(20)

    const fetchOptions = async () => {
      try {
        const [subjectsRes, servicesRes, statusesRes] = await Promise.all([
          api.get('/support-ticket-subjects'),
          api.get('/support-ticket-services'),
          api.get('/support-ticket-statuses'),
        ])
        subjects.value = subjectsRes.data?.data || []
        services.value = servicesRes.data?.data || []
        statuses.value = statusesRes.data?.data || []
      } catch (e) {
        console.warn('Could not load filter options:', e)
      }
    }

    const buildParams = () => {
      const params = {
        page: page.value,
        limit: pageSize.value,
        sort_by: sortKey.value,
        sort_direction: sortDirection.value,
      }
      if (searchTerm.value) params.search = searchTerm.value
      if (statusFilter.value) params.status_id = statusFilter.value
      if (subjectFilter.value) params.subject_id = subjectFilter.value
      if (serviceFilter.value) params.service_id = serviceFilter.value
      if (priorityFilter.value) params.priority = priorityFilter.value
      if (dateFrom.value) params.date_from = dateFrom.value
      if (dateTo.value) params.date_to = dateTo.value
      return params
    }

    const parseResponse = (response) => {
      const payload = response?.data?.data ?? response?.data ?? {}
      const ticketsList = payload.tickets ?? payload.results ?? payload.items ?? []
      const totalCount = payload.pagination?.total ?? payload.total ?? payload.count ?? 0
      const pages = payload.pagination?.pages ?? Math.ceil(totalCount / pageSize.value) ?? 1
      return { ticketsList, totalCount, pages }
    }

    const getTicketList = async () => {
      loading.value = true
      try {
        const params = buildParams()
        const response = await api.get('/support-tickets', { params })
        const { ticketsList, totalCount, pages } = parseResponse(response)
        tickets.value = Array.isArray(ticketsList) ? ticketsList : []
        total.value = Number(totalCount) || 0
        meta.value = {
          page: page.value,
          limit: pageSize.value,
          total: Number(totalCount) || 0,
          pages: Math.max(1, pages),
        }
      } catch (e) {
        toast?.error?.('Failed to load tickets: ' + (e?.message || e))
        tickets.value = []
        total.value = 0
        meta.value = { page: 1, limit: pageSize.value, total: 0, pages: 1 }
      } finally {
        loading.value = false
      }
    }

    const applyFilters = () => {
      page.value = 1
      getTicketList()
    }

    const clearFilters = () => {
      searchTerm.value = ''
      statusFilter.value = ''
      subjectFilter.value = ''
      serviceFilter.value = ''
      priorityFilter.value = ''
      dateFrom.value = ''
      dateTo.value = ''
      page.value = 1
      getTicketList()
    }

    const hasActiveFilters = computed(() => 
      searchTerm.value.trim() || statusFilter.value || subjectFilter.value || 
      serviceFilter.value || priorityFilter.value || dateFrom.value || dateTo.value
    )

    const toggleSort = (key) => {
      if (sortKey.value === key) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
        return
      }
      sortKey.value = key
      sortDirection.value = 'asc'
      getTicketList()
    }

    const sortIndicator = (key) => {
      if (sortKey.value !== key) return 'fa-sort'
      return sortDirection.value === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
    }

    const prev = () => {
      if (page.value > 1) {
        page.value--
        getTicketList()
      }
    }

    const next = () => {
      if (page.value < meta.value.pages) {
        page.value++
        getTicketList()
      }
    }

    const changePageSize = (ps) => {
      pageSize.value = Number(ps) || 20
      page.value = 1
      getTicketList()
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

    const viewTicket = (ticketId) => {
      router.push(`/support/tickets/${ticketId}`)
    }

    const createTicket = () => {
      router.push('/support/tickets/create')
    }

    const showingRange = computed(() => {
      const { page: currentPage, limit, total: totalCount } = meta.value
      if (totalCount === 0) return 'Showing 0 of 0 tickets'
      const start = (currentPage - 1) * limit + 1
      const end = Math.min(currentPage * limit, totalCount)
      return `Showing ${start}–${end} of ${totalCount} ticket${totalCount !== 1 ? 's' : ''}`
    })

    onMounted(() => {
      fetchOptions()
      getTicketList()
    })

    return {
      loading,
      tickets,
      subjects,
      services,
      statuses,
      total,
      meta,
      searchTerm,
      statusFilter,
      subjectFilter,
      serviceFilter,
      priorityFilter,
      dateFrom,
      dateTo,
      sortKey,
      sortDirection,
      page,
      pageSize,
      hasActiveFilters,
      getTicketList,
      applyFilters,
      clearFilters,
      toggleSort,
      sortIndicator,
      prev,
      next,
      changePageSize,
      formatDate,
      getStatusBadgeClass,
      getPriorityBadgeClass,
      viewTicket,
      createTicket,
      showingRange,
    }
  }
}