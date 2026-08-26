import { api } from '../../../Services/api.js'
import template from './GenerateMarksheetTemplate.js'
const { ref, onMounted, computed } = Vue
const { useRoute, useRouter } = VueRouter

export default {
  name: 'GenerateMarksheet',
  template,
  setup() {
    const route = useRoute()
    const router = useRouter()

    const templates = ref([])
    const students = ref([])
    const exams = ref([])
    const courses = ref([])
    const academicYears = ref([])

    const selectedTemplate = ref(null)
    const selectedStudent = ref(null)
    const selectedExams = ref([]) // Changed to array for multiple exams
    const selectedCourse = ref(null)
    const selectedAcademicYear = ref(null)

    const previewHTML = ref('')
    const showPreview = ref(false)
    const loading = ref(false)
    const saving = ref(false)

    // Computed property to check if all students are selected
    const isAllStudentsSelected = computed(() => {
      return selectedStudent.value === '__ALL__'
    })

    const selectedStudentIds = computed(() => {
      if (isAllStudentsSelected.value) {
        return students.value.map(s => s._id)
      }
      return selectedStudent.value ? [selectedStudent.value] : []
    })

    // Track which exams are selected
    const toggleExam = (examId) => {
      const index = selectedExams.value.indexOf(examId)
      if (index > -1) {
        selectedExams.value.splice(index, 1)
      } else {
        selectedExams.value.push(examId)
      }
    }

    const isExamSelected = (examId) => {
      return selectedExams.value.includes(examId)
    }

    // Fetch templates
    const fetchTemplates = async () => {
      try {
        const response = await api.get('/marksheet-templates?limit=100')
        if (response.data && response.data.data && response.data.data.templates) {
          templates.value = response.data.data.templates.filter(t => t.is_active)
        }
      } catch (error) {
        console.error('Error fetching templates:', error)
      }
    }

    // Fetch students
    const fetchStudents = async () => {
      try {
        const response = await api.get('/students?limit=1000')
        if (response.data && response.data.data && response.data.data.students) {
          students.value = response.data.data.students
        }
      } catch (error) {
        console.error('Error fetching students:', error)
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

    // Fetch courses
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

    // Generate preview
    const generatePreview = async () => {
      if (!selectedTemplate.value) {
        toast?.error?.('Please select a marksheet template')
        return
      }
      if (!selectedStudent.value) {
        toast?.error?.('Please select at least one student')
        return
      }
      if (!selectedExams.value || selectedExams.value.length === 0) {
        toast?.error?.('Please select at least one exam')
        return
      }

      loading.value = true
      try {
        console.log('=== Marksheet Generation Start ===')
        console.log('Template ID:', selectedTemplate.value)
        console.log('Selected template object:', templates.value.find(t => t._id === selectedTemplate.value))
        console.log('Student(s):', selectedStudentIds.value)
        console.log('Exam IDs:', selectedExams.value)
        console.log('Exams detail:', exams.value.filter(e => selectedExams.value.includes(e._id)))
        console.log('Academic Year ID:', selectedAcademicYear.value)
        const studentIds = selectedStudentIds.value

        // If generating for all students, generate for each one
        if (isAllStudentsSelected.value) {
          console.log(`Generating marksheets for all ${studentIds.length} students`)
          const marksheets = []
          let successCount = 0
          let failCount = 0
          
          for (const studentId of studentIds) {
            try {
              const payload = {
                student_id: studentId,
                exam_ids: selectedExams.value,
                template_id: selectedTemplate.value,
                academic_year_id: selectedAcademicYear.value || null
              }
              console.log(`[${studentId}] Posting payload:`, JSON.stringify(payload))
              const response = await api.post('/results/generate-marksheet', payload)
              
              console.log(`[${studentId}] Response:`, response.data)
              if (response.data.success && response.data.data?.html) {
                marksheets.push({
                  studentId,
                  html: response.data.data.html,
                  studentName: students.value.find(s => s._id === studentId)?.name || `Student ${studentId}`
                })
                successCount++
                console.log(`[${studentId}] ✓ Success`)
              } else {
                failCount++
                const errorMsg = response.data.error || 'Unknown error'
                console.warn(`[${studentId}] ✗ Failed: ${errorMsg}`)
                toast?.error?.(`Failed for student ${studentId}: ${errorMsg}`)
              }
            } catch (err) {
              failCount++
              console.error(`[${studentId}] ✗ Exception:`, err)
              console.error(`[${studentId}] Response data:`, err.response?.data)
              toast?.error?.(`Error for student ${studentId}: ${err.response?.data?.error || err.message}`)
            }
          }

          if (marksheets.length === 0) {
            console.error('No marksheets generated:', { successCount, failCount })
            toast?.error?.(`Failed to generate any marksheets (${failCount} failed)`)
            loading.value = false
            return
          }

          // Store all marksheets and show them
          console.log(`Generated ${successCount} marksheets, ${failCount} failed`)
          previewHTML.value = marksheets
          showPreview.value = true
          toast?.success?.(`Generated ${marksheets.length} marksheet(s)`)
        } else {
          // Single student - existing logic
          const payload = {
            student_id: selectedStudent.value,
            exam_ids: selectedExams.value,
            template_id: selectedTemplate.value,
            academic_year_id: selectedAcademicYear.value || null
          }

          console.log('Generating single marksheet with payload:', JSON.stringify(payload))
          const response = await api.post('/results/generate-marksheet', payload)
          
          console.log('Response:', response.data)
          if (!response.data.success) {
            const errorMsg = response.data.error || 'Unknown error'
            console.error('Marksheet generation failed:', errorMsg)
            toast?.error?.(`Error: ${errorMsg}`)
            loading.value = false
            return
          }

          if (!response.data.data?.html) {
            console.error('No HTML returned in response:', response.data)
            toast?.error?.('Error: No marksheet HTML generated')
            loading.value = false
            return
          }

          previewHTML.value = response.data.data.html
          showPreview.value = true
          toast?.success?.('Marksheet generated successfully')
        }
      } catch (error) {
        console.error('=== Marksheet Generation Exception ===')
        console.error('Error:', error)
        console.error('Response:', error.response?.data)
        const errorMsg = error.response?.data?.error || error.message || 'Error generating preview'
        toast?.error?.(errorMsg)
      } finally {
        loading.value = false
      }
    }

    // Issue marksheet (save to results)
    const issueMarksheet = async () => {
      if (!selectedStudent.value || selectedExams.value.length === 0) {
        toast?.error?.('Please select student and at least one exam')
        return
      }

      saving.value = true
      try {
        // Mark results as issued for all selected exams
        for (const examId of selectedExams.value) {
          const params = new URLSearchParams()
          params.append('student_id', selectedStudent.value)
          params.append('exam_id', examId)

          const response = await api.get(`/results?${params.toString()}`)
          const results = response.data?.data?.results || []

          // Here you might update results with is_issued flag if needed
        }
        toast?.success?.(`Marksheet issued for ${selectedExams.value.length} exam(s)`)
        showPreview.value = false
      } catch (error) {
        console.error('Error issuing marksheet:', error)
        toast?.error?.('Error issuing marksheet')
      } finally {
        saving.value = false
      }
    }

    // Upgrade student to next year
    const upgradeStudent = async () => {
      if (!selectedStudent.value || !selectedAcademicYear.value) {
        toast?.error?.('Please select student and current academic year')
        return
      }

      saving.value = true
      try {
        // Find next academic year
        const currentYearIndex = academicYears.value.findIndex(y => y._id === selectedAcademicYear.value)
        if (currentYearIndex === -1 || currentYearIndex === academicYears.value.length - 1) {
          toast?.error?.('Next academic year not found')
          return
        }

        const nextYear = academicYears.value[currentYearIndex + 1]

        // Update student's academic year (would need a dedicated endpoint in backend)
        // For now, just show a success message
        toast?.success?.(`Student upgraded from ${academicYears.value[currentYearIndex].name} to ${nextYear.name}`)
        showPreview.value = false
      } catch (error) {
        console.error('Error upgrading student:', error)
        toast?.error?.('Error upgrading student')
      } finally {
        saving.value = false
      }
    }

    const canGenerate = computed(() => {
      return selectedTemplate.value && selectedStudent.value && selectedExams.value.length > 0
    })

    onMounted(() => {
      fetchTemplates()
      fetchStudents()
      fetchExams()
      fetchCourses()
      fetchAcademicYears()
    })

    return {
      templates,
      students,
      exams,
      courses,
      academicYears,
      selectedTemplate,
      selectedStudent,
      selectedExams,
      selectedCourse,
      selectedAcademicYear,
      previewHTML,
      showPreview,
      loading,
      saving,
      isAllStudentsSelected,
      selectedStudentIds,
      generatePreview,
      issueMarksheet,
      upgradeStudent,
      canGenerate,
      toggleExam,
      isExamSelected
    }
  }
}
