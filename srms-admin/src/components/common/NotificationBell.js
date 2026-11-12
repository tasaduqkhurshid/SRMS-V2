import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import template from "./NotificationBell.template.js"
import { io } from 'socket.io-client'

export default {
  name: "AdminNotificationBell",
  props: {
    token: { type: String, required: true },
    apiBase: { type: String, default: '/api/admin/notifications' },
  },
  template,
  setup(props) {
    const router = useRouter()
    const notificationCount = ref(0)
    const notifications = ref([])
    const showModal = ref(false)
    const allNotificationsOpen = ref(false)
    const allNotifications = ref([])
    const loading = ref(false)
    const error = ref(null)
    let socket = null
    let pollInterval = null

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`${props.apiBase}/unread-count`, {
          headers: { 'Authorization': `Bearer ${props.token}` }
        })
        if (response.ok) {
          const data = await response.json()
          notificationCount.value = data.data?.unreadCount || 0
        }
      } catch (err) {
        console.error('Failed to fetch unread count:', err)
      }
    }

    const fetchNotifications = async (limit = 10) => {
      loading.value = true
      error.value = null
      try {
        const response = await fetch(`${props.apiBase}?limit=${limit}`, {
          headers: { 'Authorization': `Bearer ${props.token}` }
        })
        if (response.ok) {
          const data = await response.json()
          notifications.value = data.data || []
        } else {
          error.value = 'Failed to load notifications'
        }
      } catch (err) {
        error.value = 'Failed to load notifications'
        console.error('Failed to fetch notifications:', err)
      } finally {
        loading.value = false
      }
    }

    const fetchAllNotifications = async () => {
      loading.value = true
      error.value = null
      try {
        const response = await fetch(`${props.apiBase}?limit=100`, {
          headers: { 'Authorization': `Bearer ${props.token}` }
        })
        if (response.ok) {
          const data = await response.json()
          allNotifications.value = data.data || []
        } else {
          error.value = 'Failed to load notifications'
        }
      } catch (err) {
        error.value = 'Failed to load notifications'
        console.error('Failed to fetch notifications:', err)
      } finally {
        loading.value = false
      }
    }

    const markAsRead = async (notificationId) => {
      try {
        const response = await fetch(`${props.apiBase}/${notificationId}/read`, {
          method: 'PATCH',
          headers: { 
            'Authorization': `Bearer ${props.token}`,
            'Content-Type': 'application/json'
          }
        })
        if (response.ok) {
          const notification = notifications.value.find(n => n._id === notificationId)
          if (notification) {
            notification.is_read = true
            notification.read_at = new Date().toISOString()
          }
          await fetchUnreadCount()
        }
      } catch (err) {
        console.error('Failed to mark as read:', err)
      }
    }

    const markAllAsRead = async () => {
      try {
        const response = await fetch(`${props.apiBase}/read-all`, {
          method: 'PATCH',
          headers: { 
            'Authorization': `Bearer ${props.token}`,
            'Content-Type': 'application/json'
          }
        })
        if (response.ok) {
          notifications.value.forEach(n => {
            n.is_read = true
            n.read_at = new Date().toISOString()
          })
          notificationCount.value = 0
        }
      } catch (err) {
        console.error('Failed to mark all as read:', err)
      }
    }

    const handleNotificationClick = async (notification) => {
      if (!notification.is_read) {
        await markAsRead(notification._id)
      }
      if (notification.action_url) {
        showModal.value = false
        router.push(notification.action_url)
      }
    }

    const formatTimeAgo = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      return date.toLocaleDateString()
    }

    const getNotificationIcon = (type) => {
      const icons = {
        info: 'fa-solid fa-circle-info',
        success: 'fa-solid fa-circle-check',
        warning: 'fa-solid fa-triangle-exclamation',
        error: 'fa-solid fa-circle-exclamation',
      }
      return icons[type] || icons.info
    }

    const connectSocket = () => {
      if (!props.token) return

      try {
        socket = io(window.location.origin, {
          auth: { token: props.token },
          transports: ['websocket', 'polling'],
        })

        socket.on('connect', () => {
          console.log('Admin socket connected for notifications')
        })

        socket.on('notification:new', (notification) => {
          notifications.value.unshift(notification)
          if (notifications.value.length > 10) notifications.value.pop()
          fetchUnreadCount()
        })

        socket.on('notification:count-updated', (data) => {
          notificationCount.value = data.unreadCount || 0
        })

        socket.on('notification:read', (data) => {
          const notification = notifications.value.find(n => n._id === data.notificationId)
          if (notification) {
            notification.is_read = true
            notification.read_at = data.readAt
          }
          fetchUnreadCount()
        })

        socket.on('notification:read-all', () => {
          notifications.value.forEach(n => { n.is_read = true })
          notificationCount.value = 0
        })

        socket.on('disconnect', (reason) => {
          console.log('Admin socket disconnected:', reason)
        })

        socket.on('connect_error', (err) => {
          console.error('Admin socket connection error:', err)
        })
      } catch (err) {
        console.error('Failed to initialize admin socket:', err)
      }
    }

    const startPolling = () => {
      pollInterval = setInterval(() => {
        fetchUnreadCount()
      }, 30000)
    }

    const stopPolling = () => {
      if (pollInterval) clearInterval(pollInterval)
    }

    const handleClickOutside = (event) => {
      if (!event.target.closest('.admin-notification-bell-wrapper')) {
        showModal.value = false
      }
    }

    onMounted(() => {
      fetchUnreadCount()
      connectSocket()
      startPolling()
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      stopPolling()
      if (socket) {
        socket.disconnect()
        socket = null
      }
      document.removeEventListener('click', handleClickOutside)
    })

    const openModal = async () => {
      showModal.value = true
      if (notifications.value.length === 0) {
        await fetchNotifications()
      }
    }

    const closeModal = () => {
      showModal.value = false
    }

    const goToNotificationsPage = () => {
      showModal.value = false
      allNotificationsOpen.value = true
      fetchAllNotifications()
    }

    return {
      notificationCount,
      notifications,
      showModal,
      allNotificationsOpen,
      allNotifications,
      loading,
      error,
      fetchUnreadCount,
      fetchNotifications,
      fetchAllNotifications,
      markAsRead,
      markAllAsRead,
      handleNotificationClick,
      formatTimeAgo,
      getNotificationIcon,
      openModal,
      closeModal,
      goToNotificationsPage,
    }
  },
}