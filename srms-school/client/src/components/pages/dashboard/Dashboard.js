import { api } from '../../../Services/api.js'
import template from "./DashboardTemplate.js"
import AppLayout from "../../common/AppLayout.js" // admin shell with Sidebar + Header
const { ref, reactive, onMounted } = Vue
const { useRouter } = VueRouter

export default {
  name: "DashboardPage",
  components: { AppLayout },
  template,
  setup() {
    const router = useRouter()
    const totals = reactive({
      students: 0,
      subjects: 0,
      exams: 0,
      results: 0
    })

    const recentExams = ref([])
    const recentStudents = ref([])
    const loading = ref(true)

    // Fetch dashboard statistics
    const fetchStats = async () => {
      try {
        const [studentRes, subjectRes, examRes, resultRes] = await Promise.all([
          api.get('/students?limit=1'),
          api.get('/subjects?limit=1'),
          api.get('/exams?limit=1'),
          api.get('/results?limit=1')
        ])

        totals.students = studentRes.data?.data?.meta?.total || 0
        totals.subjects = subjectRes.data?.data?.meta?.total || 0
        totals.exams = examRes.data?.data?.meta?.total || 0
        totals.results = resultRes.data?.data?.meta?.total || 0

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

    onMounted(() => {
      fetchStats()
    })

    return {
      totals,
      recentExams,
      recentStudents,
      loading,
      router
    }
  }
}
