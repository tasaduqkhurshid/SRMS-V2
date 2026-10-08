import { api } from '../../../Services/api.js'
import template from "./DashboardTemplate.js"
const { ref, reactive, onMounted, computed } = Vue
const { useRouter } = VueRouter

export default {
  name: "DashboardPage",
  template,
  setup() {
    const router = useRouter()
    const totals = reactive({
      students: 0,
      subjects: 0,
      exams: 0,
      results: 0,
      courses: 0
    })

    const recentExams = ref([])
    const recentStudents = ref([])
    const loading = ref(true)
    const currentDate = ref('')
    const adminName = ref('Admin')

    // Time-aware greeting
    const greeting = computed(() => {
      const hour = new Date().getHours()
      if (hour < 12) return 'Good morning'
      if (hour < 17) return 'Good afternoon'
      return 'Good evening'
    })

    // Format current date
    const formatCurrentDate = () => {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      currentDate.value = new Date().toLocaleDateString('en-US', options)
    }

    // Fetch dashboard statistics
    const fetchStats = async () => {
      try {
        const [studentRes, subjectRes, examRes, resultRes, courseRes] = await Promise.all([
          api.get('/students?limit=1'),
          api.get('/subjects?limit=1'),
          api.get('/exams?limit=1'),
          api.get('/results?limit=1'),
          api.get('/courses?limit=1')
        ])

        totals.students = studentRes.data?.data?.meta?.total || 0
        totals.subjects = subjectRes.data?.data?.meta?.total || 0
        totals.exams = examRes.data?.data?.meta?.total || 0
        totals.results = resultRes.data?.data?.meta?.total || 0
        totals.courses = courseRes.data?.data?.meta?.total || 0

        // Get recent exams
        const examsData = await api.get('/exams?limit=5&order=createdAt&sort=DESC')
        recentExams.value = examsData.data?.data?.exams || []

        // Get recent students
        const studentsData = await api.get('/students?limit=5&order=createdAt&sort=DESC')
        recentStudents.value = studentsData.data?.data?.students || []
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        loading.value = false
      }
    }

    // Helper: Get student initials
    const getStudentInitials = (name) => {
      if (!name) return '?'
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    // Helper: Format date
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

    onMounted(() => {
      formatCurrentDate()
      fetchStats()
      // Load admin name from the stored session
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}')
        adminName.value = storedUser.username || storedUser.name || 'Admin'
      } catch (e) {
        adminName.value = 'Admin'
      }
    })

    // Academic overview rows — values come straight from live totals
    const overview = computed(() => {
      const items = [
        { key: 'students', label: 'Students', value: totals.students, icon: 'fa-solid fa-user-graduate', cls: 'overview-icon-students', color: '#3B82F6' },
        { key: 'subjects', label: 'Subjects', value: totals.subjects, icon: 'fa-solid fa-book-open', cls: 'overview-icon-subjects', color: '#10B981' },
        { key: 'courses', label: 'Courses', value: totals.courses, icon: 'fa-solid fa-graduation-cap', cls: 'overview-icon-courses', color: '#4F46E5' },
        { key: 'exams', label: 'Exams', value: totals.exams, icon: 'fa-solid fa-file-circle-check', cls: 'overview-icon-exams', color: '#F59E0B' },
        { key: 'results', label: 'Results', value: totals.results, icon: 'fa-solid fa-chart-bar', cls: 'overview-icon-results', color: '#F43F5E' }
      ]
      const max = Math.max(1, ...items.map(i => i.value))
      return items.map(i => ({
        ...i,
        width: i.value > 0 ? Math.max(6, Math.round((i.value / max) * 100)) : 0
      }))
    })

    return {
      totals,
      recentExams,
      recentStudents,
      loading,
      router,
      currentDate,
      adminName,
      greeting,
      getStudentInitials,
      formatDate,
      overview
    }
  }
}
