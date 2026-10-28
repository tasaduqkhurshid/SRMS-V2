import { api } from '../../../Services/api.js'
import template from './StudentPromotionTemplate.js'

const { ref, computed, onMounted, watch } = Vue

export default {
  name: 'StudentPromotion',
  template,
  setup() {
    const students = ref([])
    const courses = ref([])
    const academicYears = ref([])
    const selectedIds = ref([])
    const currentCourseId = ref('')
    const targetCourseId = ref('')
    const academicYearId = ref('')
    const search = ref('')
    const loading = ref(false)
    const saving = ref(false)

    const courseName = (value) => {
      const raw = value && typeof value === 'object' ? value._id || value.course_name || value.name : value
      const found = courses.value.find(course => String(course._id) === String(raw) ||
        String(course.course_name || course.name || '').trim().toLowerCase() === String(raw || '').trim().toLowerCase())
      return found?.course_name || found?.name || (typeof value === 'object' ? value.course_name || value.name : value) || '—'
    }

    const yearName = (value) => {
      const id = value && typeof value === 'object' ? value._id : value
      return (value && typeof value === 'object' ? value.name : null) ||
        academicYears.value.find(year => String(year._id) === String(id))?.name || '—'
    }

    const visibleStudents = computed(() => {
      const query = search.value.trim().toLowerCase()
      return students.value.filter(student => {
        const rawClass = student.class?._id || student.class
        const className = courseName(student.class)
        const selectedCourse = courses.value.find(course => String(course._id) === String(currentCourseId.value))
        const matchesCourse = !currentCourseId.value || String(rawClass) === String(currentCourseId.value) ||
          className.trim().toLowerCase() === String(selectedCourse?.course_name || selectedCourse?.name || '').trim().toLowerCase()
        const yearId = student.academic_year_id?._id || student.academic_year_id
        const matchesYear = !academicYearId.value || !yearId || String(yearId) === String(academicYearId.value)
        const matchesQuery = !query || [student.name, student.roll_number, student.admission_number, className]
          .some(value => String(value || '').toLowerCase().includes(query))
        return matchesCourse && matchesYear && matchesQuery
      })
    })

    const selectedTargetCourse = computed(() => courses.value.find(course => String(course._id) === String(targetCourseId.value)) || null)
    const allVisibleSelected = computed(() => visibleStudents.value.length > 0 && visibleStudents.value.every(student => selectedIds.value.includes(String(student._id))))

    watch([currentCourseId, academicYearId, search], () => {
      const visibleIds = new Set(visibleStudents.value.map(student => String(student._id)))
      selectedIds.value = selectedIds.value.filter(id => visibleIds.has(String(id)))
    })

    const loadData = async () => {
      loading.value = true
      try {
        const [studentResponse, courseResponse, yearResponse] = await Promise.all([
          api.get('/students?limit=1000'),
          api.get('/courses?limit=1000'),
          api.get('/options/academic-years/all'),
        ])
        students.value = studentResponse.data?.data?.students || []
        courses.value = courseResponse.data?.data?.courses || []
        academicYears.value = Array.isArray(yearResponse.data?.data) ? yearResponse.data.data : []
      } catch (error) {
        toast?.error?.(error.response?.data?.message || 'Could not load student promotion data')
      } finally {
        loading.value = false
      }
    }

    const toggleStudent = (id) => {
      const value = String(id)
      selectedIds.value = selectedIds.value.includes(value)
        ? selectedIds.value.filter(item => item !== value)
        : [...selectedIds.value, value]
    }

    const toggleAllVisible = () => {
      if (allVisibleSelected.value) {
        const visibleIds = new Set(visibleStudents.value.map(student => String(student._id)))
        selectedIds.value = selectedIds.value.filter(id => !visibleIds.has(String(id)))
      } else {
        selectedIds.value = [...new Set([...selectedIds.value, ...visibleStudents.value.map(student => String(student._id))])]
      }
    }

    const promote = async () => {
      if (!selectedIds.value.length) return toast?.error?.('Select at least one student')
      if (!targetCourseId.value) return toast?.error?.('Select the course to promote students into')
      saving.value = true
      try {
        const response = await api.post('/students/promote', {
          student_ids: selectedIds.value,
          target_course_id: targetCourseId.value,
          academic_year_id: academicYearId.value || null,
        })
        const result = response.data?.data || {}
        if (result.promoted?.length) {
          toast?.success?.(`${result.promoted.length} student${result.promoted.length === 1 ? '' : 's'} promoted to ${result.target_course}`)
        }
        if (result.failed?.length) {
          toast?.error?.(`${result.failed.length} student${result.failed.length === 1 ? '' : 's'} could not be promoted: ${result.failed.map(item => `${item.name}: ${item.message}`).join('; ')}`)
        }
        selectedIds.value = []
        await loadData()
      } catch (error) {
        toast?.error?.(error.response?.data?.message || error.message || 'Could not promote students')
      } finally {
        saving.value = false
      }
    }

    onMounted(loadData)

    return {
      students, courses, academicYears, selectedIds, currentCourseId, targetCourseId, academicYearId, search,
      loading, saving, visibleStudents, selectedTargetCourse, allVisibleSelected, courseName,
      yearName,
      toggleStudent, toggleAllVisible, promote, loadData,
    }
  },
}
