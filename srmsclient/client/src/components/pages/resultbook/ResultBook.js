import { api } from '../../../Services/api.js'
import { generateResultsTemplate, ensureXLSX } from '../../../utils/excelUtils.js'
import template from './ResultBookTemplate.js'
import ClassWiseTable from './ClassWiseTable.js'
import StudentForm from './StudentForm.js'

const { ref, reactive, onMounted, computed, watch } = Vue
const { useRouter, useRoute } = VueRouter

export default {
  name: 'ResultBook',
  template,
  components: { ClassWiseTable, StudentForm },

  setup() {

    const router = useRouter()
    const route = useRoute()

    const exams = ref([])
    const courses = ref([])
    const students = ref([])
    const academicYears = ref([])

    const selectedExam = ref(null)
    const selectedCourse = ref(null)
    const selectedAcademicYear = ref(null)
    const selectedSubjectForClass = ref(null)

    const importMode = ref('manual')
    const file = ref(null)

    const loading = ref(false)
    const uploading = ref(false)

    const viewMode = ref('class')

    const subjects = ref([])
    const subjectsForCourse = ref([])
    const studentsForSubject = ref([])

    const selectedSubjectObj = computed(() => {
      if (!selectedSubjectForClass.value) return null
      return subjectsForCourse.value.find(
        s => String(s._id) === String(selectedSubjectForClass.value)
      )
    })

    const selectedExamObj = computed(() => {
      if (!selectedExam.value) return null
      return exams.value.find(e => String(e._id) === String(selectedExam.value))
    })

    const selectedCourseObj = computed(() => {
      if (!selectedCourse.value) return null
      return courses.value.find(c => String(c._id) === String(selectedCourse.value))
    })

    const selectedMaxMarks = computed(() => {
      if (!selectedExamObj.value) return 100
      return selectedExamObj.value.max_marks || 100
    })

    const selectedAcademicYearObj = computed(() => {
      if (!selectedAcademicYear.value) return null
      return academicYears.value.find(ay => String(ay._id) === String(selectedAcademicYear.value))
    })

    const notifyOrAlert = (msg, level = 'info') => {
      if (level === 'success') {
        toast?.success?.(msg)
      } else {
        toast?.error?.(msg)
      }
    }

    /* ---------------- FETCH INITIAL DATA ---------------- */

    const fetchData = async () => {

      loading.value = true

      try {

        const [examsRes, coursesRes, subjectsRes, academicYearsRes] = await Promise.all([
          api.get('/options/exams/all'),
          api.get('/options/courses/all'),
          api.get('/options/subjects/all'),
          api.get('/options/academic-years/all')
        ])

        const normalize = (res) => {
          if (!res) return []
          if (Array.isArray(res.data)) return res.data
          if (Array.isArray(res.data?.data)) return res.data.data
          if (Array.isArray(res.data?.exams)) return res.data.exams
          if (Array.isArray(res.data?.courses)) return res.data.courses
          if (Array.isArray(res.data?.subjects)) return res.data.subjects
          return []
        }

        exams.value = normalize(examsRes)
        courses.value = normalize(coursesRes)
        subjects.value = normalize(subjectsRes)
        academicYears.value = normalize(academicYearsRes)

      } catch (error) {

        console.error(error)
        notifyOrAlert('Error loading data')

      } finally {

        loading.value = false

      }
    }

    /* ---------------- FETCH STUDENTS BY CLASS ---------------- */

    const fetchStudentsByClass = async () => {

      if (!selectedCourse.value) {
        students.value = []
        subjectsForCourse.value = []
        return
      }

      try {

        const res = await api.get(`/students/class/${selectedCourse.value}?limit=1000`)
        students.value = res.data?.data?.students || []

        const subs = await api.get(`/courses/${selectedCourse.value}/subjects?flat=true`)
        subjectsForCourse.value = subs.data?.data || subs.data || []

      } catch (error) {

        console.error(error)

      }
    }

    /* ---------------- LOAD STUDENTS FOR SUBJECT ---------------- */

    const loadStudentsForSubject = async () => {
      studentsForSubject.value = []
      
      if (!selectedSubjectForClass.value || !selectedExam.value) {
        return
      }

      // In manual entry mode, get all students and merge with existing results
      if (importMode.value === 'manual') {
        // Ensure students are loaded first
        if (!students.value.length && selectedCourse.value) {
          await fetchStudentsByClass()
        }
        
        // Fetch existing results for this exam and subject
        try {
          const res = await api.get(
            `/results?exam_id=${selectedExam.value}&subject_id=${selectedSubjectForClass.value}`
          )
          
          const data = res.data
          let existingResults = []
          if (Array.isArray(data)) {
            existingResults = data
          } else if (Array.isArray(data?.data)) {
            existingResults = data.data
          } else if (data?.success && Array.isArray(data?.data?.results)) {
            existingResults = data.data.results
          }

          // Create a map of student_id -> existing result
          const resultsMap = {}
          existingResults.forEach(r => {
            const sid = r.student_id?._id || r.student_id || r.student
            if (sid) resultsMap[String(sid)] = r
          })

          // Merge students with their existing results
          studentsForSubject.value = students.value.map(s => {
            const sid = s._id
            const result = resultsMap[String(sid)] || {}
            return {
              id: sid,
              student_id: sid,
              name: s.name,
              roll_number: s.roll_number,
              result_id: result._id || null,
              marks: {
                theory: result.theory_marks ?? null,
                lab: result.lab_marks ?? null,
                attendance: result.attendance_marks ?? null,
                activity: result.activity_marks ?? null
              },
              total_marks: result.total_marks ?? null
            }
          })
        } catch (error) {
          console.error(error)
          // If API fails, just use students without marks
          studentsForSubject.value = (students.value || []).map(s => ({
            id: s._id,
            student_id: s._id,
            name: s.name,
            roll_number: s.roll_number,
            result_id: null,
            marks: { theory: null, lab: null, attendance: null, activity: null },
            total_marks: null
          }))
        }
        return
      }

      // For file import mode, fetch students who have results for the selected subject and exam
      try {
        const res = await api.get(
          `/results?exam_id=${selectedExam.value}&subject_id=${selectedSubjectForClass.value}`
        )
        // Handle various response formats
        const data = res.data
        let results = []
        if (Array.isArray(data)) {
          results = data
        } else if (Array.isArray(data?.data)) {
          results = data.data
        } else if (data?.success && Array.isArray(data?.data?.results)) {
          results = data.data.results
        }
        
        // Transform results to include student info
        studentsForSubject.value = results.map(r => {
          const sid = r.student_id?._id || r.student_id
          return {
            id: sid,
            student_id: sid,
            student_name: r.student_id?.name || r.Student?.name || r.student_name || 'Unknown',
            name: r.student_id?.name || r.Student?.name || r.student_name || 'Unknown',
            theory_marks: r.theory_marks,
            lab_marks: r.lab_marks,
            attendance_marks: r.attendance_marks,
            activity_marks: r.activity_marks,
            total_marks: r.total_marks,
            result_id: r._id
          }
        })
      } catch (error) {
        console.error(error)
        studentsForSubject.value = []
      }
    }

    /* ---------------- HANDLE CLASSWISE SAVE ---------------- */

    const handleClasswiseSave = async (data) => {
      try {
        // Validate academic year is selected
        if (!selectedAcademicYearObj.value) {
          notifyOrAlert('Please select an academic year first', 'error')
          return
        }

        const ayId = selectedAcademicYearObj.value._id

        // Add academic_year_id to each row
        const dataWithYear = data.map(row => ({
          ...row,
          academic_year_id: ayId
        }))

        // data is an array of result objects, use bulk save endpoint
        await api.post('/results/save-class-result', { 
          rows: dataWithYear,
          academic_year_id: ayId 
        })
        notifyOrAlert('Results saved successfully', 'success')
        loadStudentsForSubject()
      } catch (error) {
        console.error(error)
        notifyOrAlert('Failed to save results')
      }
    }

    /* ---------------- HANDLE ROW UPDATE ---------------- */

    const handleRowUpdate = async (updatedRow) => {
      try {
        // Validate academic year is selected
        if (!selectedAcademicYearObj.value) {
          notifyOrAlert('Please select an academic year first', 'error')
          return
        }

        const ayId = selectedAcademicYearObj.value._id

        // If there's an existing result_id, update it; otherwise create new
        const payload = {
          _id: updatedRow.result_id || null,
          student_id: updatedRow.student_id,
          exam_id: updatedRow.exam_id,
          subject_id: updatedRow.subject_id,
          academic_year_id: ayId,
          theory_marks: parseFloat(updatedRow.marks?.theory) || 0,
          lab_marks: parseFloat(updatedRow.marks?.lab) || 0,
          attendance_marks: parseFloat(updatedRow.marks?.attendance) || 0,
          activity_marks: parseFloat(updatedRow.marks?.activity) || 0,
          total_marks: parseFloat(updatedRow.total) || 0
        }

        if (updatedRow.result_id) {
          payload._id = updatedRow.result_id
        }

        const res = await api.post('/results/save', payload)
        
        // Get the saved result id (for new records)
        const savedId = res.data?.data?._id || updatedRow.result_id
        
        notifyOrAlert('Marks updated successfully', 'success')
        
        // Update local state with nested marks format
        const index = studentsForSubject.value.findIndex(s => s._id === updatedRow.student_id)
        if (index !== -1) {
          studentsForSubject.value[index] = {
            ...studentsForSubject.value[index],
            result_id: savedId,
            marks: {
              theory: parseFloat(updatedRow.marks?.theory) || 0,
              lab: parseFloat(updatedRow.marks?.lab) || 0,
              attendance: parseFloat(updatedRow.marks?.attendance) || 0,
              activity: parseFloat(updatedRow.marks?.activity) || 0
            },
            total_marks: parseFloat(updatedRow.total) || 0
          }
        }
      } catch (error) {
        console.error(error)
        notifyOrAlert('Failed to update marks')
      }
    }

    /* ---------------- FILE INPUT ---------------- */

    const onFileChange = (e) => {
      file.value = e.target.files?.[0] || null
    }

    /* ---------------- IMPORT EXCEL ---------------- */

    const importResultsFromFile = async () => {

      if (!file.value) {
        notifyOrAlert('Please select a file')
        return
      }

      uploading.value = true

      try {

        await ensureXLSX()
        const XLSX = window.XLSX

        const reader = new FileReader()

        reader.onload = async (event) => {

          // Validate academic year is selected
          if (!selectedAcademicYearObj.value) {
            notifyOrAlert('Please select an academic year first', 'error')
            uploading.value = false
            return
          }

          const data = new Uint8Array(event.target.result)
          const workbook = XLSX.read(data, { type: 'array' })

          const resultRows = []

          workbook.SheetNames.forEach(sheetName => {

            const worksheet = workbook.Sheets[sheetName]
            const rows = XLSX.utils.sheet_to_json(worksheet)

            rows.forEach(row => {

              const studentId = Number(row['Student ID'] || row['student_id'])
              if (!studentId) return

              const theory = row['Theory'] !== undefined ? Number(row['Theory']) : null
              const lab = row['Lab'] !== undefined ? Number(row['Lab']) : null
              const attendance = row['Attendance'] !== undefined ? Number(row['Attendance']) : null
              const activity = row['Activity'] !== undefined ? Number(row['Activity']) : null

              const subject = subjectsForCourse.value.find(
                s =>
                  (s.subject_code || s.subject_name).toLowerCase() ===
                  sheetName.toLowerCase()
              )

              if (!subject) return

              resultRows.push({
                student_id: studentId,
                exam_id: selectedExam.value,
                subject_id: subject._id,
                academic_year_id: selectedAcademicYearObj.value._id,
                theory_marks: theory,
                lab_marks: lab,
                attendance_marks: attendance,
                activity_marks: activity,
                total_marks: (theory || 0) + (lab || 0) + (attendance || 0) + (activity || 0)
              })

            })

          })

          if (!resultRows.length) {
            notifyOrAlert('No valid data found')
            uploading.value = false
            return
          }

          await api.post('/results/save-class-result', { 
            rows: resultRows,
            academic_year_id: selectedAcademicYearObj.value._id
          })

          notifyOrAlert(`Imported ${resultRows.length} results`, 'success')

          file.value = null

          await fetchStudentsByClass()

          uploading.value = false

        }

        reader.readAsArrayBuffer(file.value)

      } catch (error) {

        console.error(error)
        notifyOrAlert('Import failed')

        uploading.value = false

      }
    }

    /* ---------------- DOWNLOAD TEMPLATE ---------------- */

    const downloadResultsTemplate = async () => {

      if (!selectedCourse.value || !selectedExam.value) {
        notifyOrAlert('Please select class and exam')
        return
      }

      try {

        const courseSubjectsRes = await api.get(
          `/courses/${selectedCourse.value}/subjects?flat=true`
        )

        const courseSubjects = courseSubjectsRes.data?.data || []

        const exam = exams.value.find(e => e._id === selectedExam.value)
        const course = courses.value.find(c => c._id === selectedCourse.value)

        let subjectsToExport = []

        if (selectedSubjectForClass.value === '__ALL__') {

          subjectsToExport = subjectsForCourse.value

        } else if (selectedSubjectForClass.value) {

          const subject = selectedSubjectObj.value
          subjectsToExport = subject ? [subject] : []

        } else {

          subjectsToExport = courseSubjects

        }

        await generateResultsTemplate(
          subjectsToExport,
          students.value.slice().sort((a, b) => (a.roll_number || '').localeCompare(b.roll_number || '')),
          course?.course_code || 'Course',
          exam?.exam_name || 'Exam',
          course?.course_name || ''
        )

      } catch (error) {

        console.error(error)
        notifyOrAlert('Template generation failed')

      }
    }

    /* ---------------- WATCHERS ---------------- */

    watch(selectedCourse, () => {
      fetchStudentsByClass()
    })

    watch(selectedSubjectForClass, () => {
      loadStudentsForSubject()
    })

    watch(importMode, () => {
      loadStudentsForSubject()
    })

    /* ---------------- MOUNT ---------------- */

    onMounted(() => {

      fetchData()
      
      // Auto-select current academic year
      const now = new Date()
      const currentYear = now.getFullYear()
      // Academic years typically run April-March, so check current or previous year
      let currentAcademicYear = `${currentYear}-${currentYear + 1}`
      if (now.getMonth() < 3) { // January, February, March
        currentAcademicYear = `${currentYear - 1}-${currentYear}`
      }
      
      // Try to find and auto-select the current academic year
      const autoSelectYear = () => {
        if (academicYears.value.length > 0) {
          const found = academicYears.value.find(ay => ay.name === currentAcademicYear)
          if (found) {
            selectedAcademicYear.value = found._id
          } else if (academicYears.value.length > 0) {
            // If exact match not found, select the first one (most recent)
            selectedAcademicYear.value = academicYears.value[0]._id
          }
        }
      }
      
      // Delay auto-select to ensure data is loaded
      setTimeout(autoSelectYear, 500)

      if (route.path.includes('class-wise'))
        viewMode.value = 'class'
      else if (route.path.includes('student-wise'))
        viewMode.value = 'student'

    })

    /* ---------------- RETURN ---------------- */

    return {
      exams,
      courses,
      students,
      academicYears,
      subjects,
      subjectsForCourse,
      studentsForSubject,

      selectedExam,
      selectedCourse,
      selectedAcademicYear,
      selectedSubjectForClass,
      selectedSubjectObj,
      selectedExamObj,
      selectedCourseObj,
      selectedMaxMarks,
      selectedAcademicYearObj,

      importMode,
      file,
      loading,
      uploading,
      viewMode,

      onFileChange,
      importResultsFromFile,
      downloadResultsTemplate,
      fetchStudentsByClass,
      loadStudentsForSubject,
      handleClasswiseSave,
      handleRowUpdate,

      notifyOrAlert
    }

  }
}