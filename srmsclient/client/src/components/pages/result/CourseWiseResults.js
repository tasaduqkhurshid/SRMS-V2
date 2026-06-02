import { api } from '../../../Services/api.js'
import template from './CourseWiseResultsTemplate.js'
const { ref, onMounted } = Vue
const { useRouter } = VueRouter

export default {
  name: 'CourseWiseResults',
  template,
  setup() {
    const route = useRoute()
    const router = useRouter()

    const results = ref([])
    const courses = ref([])
    const academicYears = ref([])
    const exams = ref([])

    const filters = ref({
      course_id: null,
      exam_id: null,
      academic_year_id: null,
      page: 1,
      limit: 50
    })

    const loading = ref(false)
    const totalRecords = ref(0)

    // Fetch courses dropdown
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses?limit=1000')
        if (response.data && response.data.data && response.data.data.courses) {
          courses.value = response.data.data.courses
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
      }
    }

    // Fetch academic years
    const fetchAcademicYears = async () => {
      try {
        const response = await api.get('/options/academic-years/all')
        if (response.data && Array.isArray(response.data.data)) {
          academicYears.value = response.data.data
        }
      } catch (error) {
        console.error('Error fetching academic years:', error)
      }
    }

    // Fetch exams
    const fetchExams = async () => {
      try {
        const response = await api.get('/exams?limit=1000')
        if (response.data && response.data.data && response.data.data.exams) {
          exams.value = response.data.data.exams
        }
      } catch (error) {
        console.error('Error fetching exams:', error)
      }
    }

    // Fetch results with filters
    const fetchResults = async () => {
      loading.value = true
      try {
        const params = new URLSearchParams()
        if (filters.value.course_id) params.append('course_id', filters.value.course_id)
        if (filters.value.exam_id) params.append('exam_id', filters.value.exam_id)
        if (filters.value.academic_year_id) params.append('academic_year_id', filters.value.academic_year_id)
        params.append('page', filters.value.page)
        params.append('limit', filters.value.limit)

        const response = await api.get(`/results?${params.toString()}`)
        if (response.data && response.data.data) {
          results.value = response.data.data.results || []
          if (response.data.data.meta) {
            totalRecords.value = response.data.data.meta.total || 0
          }
        }
      } catch (error) {
        console.error('Error fetching results:', error)
      } finally {
        loading.value = false
      }
    }

    // Apply filters
    const applyFilters = () => {
      filters.value.page = 1
      fetchResults()
    }

    // Reset filters
    const resetFilters = () => {
      filters.value = {
        course_id: null,
        exam_id: null,
        academic_year_id: null,
        page: 1,
        limit: 50
      }
      fetchResults()
    }

    // Pagination
    const goToPage = (page) => {
      filters.value.page = page
      fetchResults()
    }

    const totalPages = () => {
      return Math.ceil(totalRecords.value / filters.value.limit)
    }

    onMounted(() => {
      fetchCourses()
      fetchAcademicYears()
      fetchExams()
      fetchResults()
    })

    return {
      results,
      courses,
      academicYears,
      exams,
      filters,
      loading,
      totalRecords,
      fetchResults,
      applyFilters,
      resetFilters,
      goToPage,
      totalPages
    }
  }
}
