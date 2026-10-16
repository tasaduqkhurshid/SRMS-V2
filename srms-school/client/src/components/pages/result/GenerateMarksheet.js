import { api } from '../../../Services/api.js'
import template from './GenerateMarksheetTemplate.js'
const { ref, onMounted, computed, watch } = Vue
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
        return visibleStudents.value.map(s => s._id)
      }
      return selectedStudent.value ? [selectedStudent.value] : []
    })

    const visibleStudents = computed(() => students.value.filter(student => {
      const studentCourse = student.class?._id || student.class
      const studentYear = student.academic_year_id?._id || student.academic_year_id
      const matchesCourse = !selectedCourse.value || String(studentCourse || '') === String(selectedCourse.value)
      const matchesYear = !selectedAcademicYear.value || !studentYear || String(studentYear) === String(selectedAcademicYear.value)
      return matchesCourse && matchesYear
    }))

    watch([selectedCourse, selectedAcademicYear], () => {
      if (selectedStudent.value && selectedStudent.value !== '__ALL__' && !visibleStudents.value.some(student => String(student._id) === String(selectedStudent.value))) {
        selectedStudent.value = null
      }
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

    const selectAllExams = () => {
      selectedExams.value = exams.value.map(exam => exam._id)
    }

    const clearSelectedExams = () => {
      selectedExams.value = []
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
        const studentIds = selectedStudentIds.value

        // If generating for all students, generate for each one
        if (isAllStudentsSelected.value) {
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
              const response = await api.post('/results/generate-marksheet', payload)
              if (response.data.success && response.data.data?.html) {
                marksheets.push({
                  studentId,
                  html: response.data.data.html,
                  studentName: students.value.find(s => s._id === studentId)?.name || `Student ${studentId}`
                })
                successCount++
              } else {
                failCount++
                const errorMsg = response.data.error || 'Unknown error'
                toast?.error?.(`Failed for student ${studentId}: ${errorMsg}`)
              }
            } catch (err) {
              failCount++
              toast?.error?.(`Error for student ${studentId}: ${err.response?.data?.error || err.message}`)
            }
          }

          if (marksheets.length === 0) {
            toast?.error?.(`Failed to generate any marksheets (${failCount} failed)`)
            loading.value = false
            return
          }

          // Store all marksheets and show them
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

          const response = await api.post('/results/generate-marksheet', payload)
          if (!response.data.success) {
            const errorMsg = response.data.error || 'Unknown error'
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
        const errorMsg = error.response?.data?.error || error.message || 'Error generating preview'
        toast?.error?.(errorMsg)
      } finally {
        loading.value = false
      }
    }

    const printMarksheet = () => {
      const sheets = Array.isArray(previewHTML.value) ? previewHTML.value : [{ html: previewHTML.value }]
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        toast?.error?.('Allow pop-ups to print the marksheet')
        return
      }
      printWindow.opener = null
      printWindow.document.write(`<!doctype html><html><head><title>Student Marksheet</title><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;margin:20px}.sheet{page-break-after:always}.sheet:last-child{page-break-after:auto}@media print{body{margin:0}}</style></head><body>${sheets.map(sheet => `<section class="sheet">${sheet.html || ''}</section>`).join('')}</body></html>`)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }

    // Upgrade student to next year
    const upgradeStudent = async () => {
      if (!selectedStudent.value || selectedStudent.value === '__ALL__' || !selectedAcademicYear.value) {
        toast?.error?.('Select one student and the current academic year to upgrade')
        return
      }

      saving.value = true
      try {
        const sortedYears = [...academicYears.value].sort((a, b) => {
          const yearStart = year => year.start_date ? new Date(year.start_date).getTime() : Number(String(year.name || '').match(/\d{4}/)?.[0] || 0)
          return yearStart(a) - yearStart(b)
        })
        const currentYearIndex = sortedYears.findIndex(y => String(y._id) === String(selectedAcademicYear.value))
        if (currentYearIndex === -1 || currentYearIndex === sortedYears.length - 1) {
          toast?.error?.('Next academic year not found')
          return
        }
        const currentYear = sortedYears[currentYearIndex]
        const nextYear = sortedYears[currentYearIndex + 1]
        const student = visibleStudents.value.find(item => String(item._id) === String(selectedStudent.value))
        if (!student) throw new Error('Selected student is no longer available for this course and year')
        const response = await api.post('/students/save', {
          studentId: student._id,
          name: student.name,
          roll_number: student.roll_number,
          admission_number: student.admission_number,
          class: student.class?._id || student.class,
          section: student.section,
          gender: student.gender,
          dob: student.dob,
          father_name: student.father_name,
          mother_name: student.mother_name,
          address: student.address,
          pincode: student.pincode,
          academic_year_id: nextYear._id
        })
        if (response.data?.status !== 'success') throw new Error(response.data?.message || 'Could not upgrade student')
        toast?.success?.(`${student.name} upgraded from ${currentYear.name} to ${nextYear.name}`)
        showPreview.value = false
      } catch (error) {
        toast?.error?.(error.response?.data?.message || error.message || 'Could not upgrade student')
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
      visibleStudents,
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
      printMarksheet,
      upgradeStudent,
      canGenerate,
      toggleExam,
      isExamSelected,
      selectAllExams,
      clearSelectedExams
    }
  }
}
