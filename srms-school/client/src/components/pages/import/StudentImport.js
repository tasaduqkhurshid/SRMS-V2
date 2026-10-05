import { api } from '../../../Services/api.js'
import template from './StudentImportTemplate.js'
const { ref, reactive, onMounted } = Vue

export default {
  name: 'StudentImport',
  template,
  setup() {
    const courses = ref([])
    const file = ref(null)
    const selectedCourse = ref(null)
    const loading = ref(false)
    const uploading = ref(false)
    const importProgress = ref(0)
    const importResults = reactive({
      success: 0,
      failed: 0,
      errors: []
    })

    // Fetch courses from cached endpoint
    const fetchCourses = async () => {
      loading.value = true
      try {
        console.log('Fetching courses from /options/courses/all')
        console.log("selectedCourse.value", selectedCourse.value)
        const res = await api.get('/options/courses/all')
        console.log('Courses response:', res.data)
        courses.value = res.data?.data || []
        console.log('Courses loaded:', courses.value.length)
        if (courses.value.length === 0) {
          console.warn('No courses found in database')
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
        console.error('Error details:', error.response?.data || error.message)
        toast?.error?.('Error loading courses: ' + (error.response?.data?.message || error.message))
      } finally {
        loading.value = false
      }
    }

    // Handle file selection
    const onFileChange = (e) => {
      file.value = e.target.files && e.target.files[0] ? e.target.files[0] : null
    }

    // Import students from file
    const importStudents = async () => {
      if (!file.value) {
        toast?.error?.('Please select a file')
        return
      }
      console.log("course selected ", selectedCourse.value)
      if (!selectedCourse.value) {
        toast?.error?.('Please select a course/class')
        return
      }

      uploading.value = true
      importProgress.value = 0
      importResults.success = 0
      importResults.failed = 0
      importResults.errors = []

      try {
        const formData = new FormData()
        formData.append('file', file.value)
        formData.append('course_id', selectedCourse.value)

        const response = await api.post('/students/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        if (response.data?.data) {
          importResults.success = response.data.data.success || 0
          importResults.failed = response.data.data.failed || 0
          importResults.errors = response.data.data.errors || []
        }

        toast?.success?.(`Import completed! Success: ${importResults.success}, Failed: ${importResults.failed}`)
        file.value = null
      } catch (error) {
        console.error('Error importing students:', error)
        toast?.error?.('Error importing students: ' + (error.response?.data?.message || error.message))
      } finally {
        uploading.value = false
      }
    }

    // Download template
    const downloadTemplate = () => {
      const csv = `name,roll_number,father_name,mother_name,address,pincode,class,section,gender,dob,admission_number
John Doe,STU001,Mr. Doe,Mrs. Doe,123 Main St,110001,Class 10,A,Male,2008-05-15,ADM2024001
Jane Smith,STU002,Mr. Smith,Mrs. Smith,456 Oak Ave,110002,Class 10,A,Female,2008-06-20,ADM2024002
Bob Johnson,STU003,Mr. Johnson,Mrs. Johnson,789 Pine Rd,110003,Class 10,B,Male,2008-07-10,ADM2024003`
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'student_import_template.csv'
      a.click()
      window.URL.revokeObjectURL(url)
    }

    onMounted(() => {
      fetchCourses()
    })

    return {
      courses,
      file,
      selectedCourse,
      loading,
      uploading,
      importProgress,
      importResults,
      onFileChange,
      importStudents,
      downloadTemplate
    }
  }
}
