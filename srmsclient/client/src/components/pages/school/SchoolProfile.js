import template from './SchoolProfile-template.js'
import { ref, onMounted } from 'vue'
import { useSchool } from '../../../Services/useSchool.js'
import { useAuth } from '../../../Services/useAuth.js'
import { api } from '../../../Services/api.js'
import LocalStorageService from '../../../Services/LocalStorageService.js'

export default {
  name: 'SchoolProfile',
  template,
  setup() {
    const { user } = useAuth()
    const { schoolData } = useSchool()

    // Form states
    const loading = ref(false)
    const saving = ref(false)
    const successMessage = ref('')
    const errorMessage = ref('')
    const editMode = ref(false)

    // Form data
    const form = ref({
      school_name: '',
      abbreviation: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      website: '',
      principal_name: '',
      principal_email: '',
      year_established: '',
      board: '',
      logo_url: '',
    })

    // Load school data
    const loadSchoolData = async () => {
      try {
        loading.value = true
        errorMessage.value = ''

        // Get school ID from session or local storage
        const schoolId = user.value?.school_id || schoolData.value?.id
        if (!schoolId) {
          errorMessage.value = 'School ID not found'
          return
        }

        const response = await api.get(`/school/${schoolId}`)
        
        if (response.data.success) {
          const schoolInfo = response.data.data
          form.value = {
            school_name: schoolInfo.school_name || schoolInfo.name || '',
            abbreviation: schoolInfo.abbreviation || '',
            email: schoolInfo.email || '',
            phone: schoolInfo.phone || schoolInfo.contact_number || '',
            address: schoolInfo.address || '',
            city: schoolInfo.city || '',
            state: schoolInfo.state || '',
            pincode: schoolInfo.pincode || '',
            website: schoolInfo.website || '',
            principal_name: schoolInfo.principal_name || '',
            principal_email: schoolInfo.principal_email || '',
            year_established: schoolInfo.year_established || '',
            board: schoolInfo.board || '',
            logo_url: schoolInfo.logo_url || '',
          }
        }
      } catch (err) {
        console.error('Error loading school data:', err)
        errorMessage.value = err.response?.data?.message || 'Failed to load school data'
      } finally {
        loading.value = false
      }
    }

    // Save school data
    const saveSchoolData = async () => {
      try {
        saving.value = true
        errorMessage.value = ''
        successMessage.value = ''

        const schoolId = user.value?.school_id || schoolData.value?.id
        if (!schoolId) {
          errorMessage.value = 'School ID not found'
          return
        }

        const response = await api.put(`/school/${schoolId}`, form.value)

        if (response.data.success) {
          successMessage.value = 'School profile updated successfully!'
          
          // Update local storage
          const updatedSchool = {
            ...schoolData.value,
            ...form.value,
          }
          LocalStorageService.saveSchoolData(updatedSchool)

          editMode.value = false

          // Clear message after 3 seconds
          setTimeout(() => {
            successMessage.value = ''
          }, 3000)
        }
      } catch (err) {
        console.error('Error saving school data:', err)
        errorMessage.value = err.response?.data?.message || 'Failed to save school profile'
      } finally {
        saving.value = false
      }
    }

    // Reset form
    const resetForm = () => {
      loadSchoolData()
      editMode.value = false
      errorMessage.value = ''
    }

    // Toggle edit mode
    const toggleEditMode = () => {
      if (editMode.value) {
        resetForm()
      } else {
        editMode.value = true
      }
    }

    onMounted(() => {
      loadSchoolData()
    })

    return {
      loading,
      saving,
      successMessage,
      errorMessage,
      editMode,
      form,
      loadSchoolData,
      saveSchoolData,
      resetForm,
      toggleEditMode,
    }
  }
}
