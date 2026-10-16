import { api } from '../../../Services/api.js'
import template from './StudentWiseResultsTemplate.js'
const { ref, computed, onMounted } = Vue
const { useRouter } = VueRouter

export default {
  name: 'StudentWiseResults',
  template,
  setup() {
    const router = useRouter()

    const results = ref([])
    const students = ref([])
    const academicYears = ref([])
    const exams = ref([])

    const filters = ref({
      student_id: null,
      exam_id: null,
      academic_year_id: null,
      page: 1,
      limit: 50
    })

    const loading = ref(false)
    const totalRecords = ref(0)
    const search = ref('')

    // Fetch students dropdown
    const fetchStudents = async () => {
      try {
        const response = await api.get('/students?limit=1000')
        if (response.data && response.data.data && response.data.data.students) {
          students.value = response.data.data.students
        }
      } catch (error) {
        toast?.error?.(error.response?.data?.message || 'Could not load students')
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
        toast?.error?.(error.response?.data?.message || 'Could not load academic years')
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
        toast?.error?.(error.response?.data?.message || 'Could not load exams')
      }
    }

    // Fetch results with filters
    const fetchResults = async () => {
      loading.value = true
      try {
        const params = new URLSearchParams()
        if (filters.value.student_id) params.append('student_id', filters.value.student_id)
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
        results.value = []
        totalRecords.value = 0
        toast?.error?.(error.response?.data?.message || 'Could not load student results')
      } finally {
        loading.value = false
      }
    }

    // Apply filters
    const applyFilters = () => {
      filters.value.page = 1
      search.value = ''
      fetchResults()
    }

    // Reset filters
    const resetFilters = () => {
      filters.value = {
        student_id: null,
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

    const filteredResults = computed(() => {
      const query = search.value.trim().toLowerCase()
      return results.value.filter(result => !query || [result.student_id?.name, result.student_id?.roll_number, result.subject_id?.subject_name, result.exam_id?.exam_name].some(value => String(value || '').toLowerCase().includes(query)))
    })
    const totalPages = computed(() => Math.ceil(totalRecords.value / filters.value.limit))
    const pageResults = computed(() => filteredResults.value)
    const changePage = next => {
      filters.value.page = Math.min(Math.max(1, next), Math.max(1, totalPages.value))
      fetchResults()
    }
    const openResultBook = result => router.push({ path: '/results/result-book/student-wise', query: {
      course_id: result.student_id?.class || '',
      exam_id: result.exam_id?._id || result.exam_id || '',
      academic_year_id: result.academic_year_id?._id || result.academic_year_id || '',
      subject_id: result.subject_id?._id || result.subject_id || '',
      student_id: result.student_id?._id || result.student_id || ''
    } })

    onMounted(() => {
      fetchStudents()
      fetchAcademicYears()
      fetchExams()
      fetchResults()
    })

    return {
      results,
      students,
      academicYears,
      exams,
      filters,
      loading,
      totalRecords,
      search,
      totalPages,
      filteredResults,
      pageResults,
      changePage,
      openResultBook,
      fetchResults,
      applyFilters,
      resetFilters,
      goToPage,
    }
  }
}
