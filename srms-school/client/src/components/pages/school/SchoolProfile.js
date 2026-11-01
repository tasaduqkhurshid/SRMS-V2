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
    const uploading = ref(false)
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
      campus_image_url: '',
    })

    // File uploads
    const logoFile = ref(null)
    const welcomeImageFile = ref(null)
    const logoPreview = ref(null)
    const welcomeImagePreview = ref(null)

    // Load school data
    const loadSchoolData = async () => {
      try {
        loading.value = true
        errorMessage.value = ''

        // Use /me endpoint to get school from authenticated session (includes branding)
        const response = await api.get(`/admin/school/me`)
        
        if (response.data.success) {
          const schoolInfo = response.data.data.school || response.data.data
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
            logo_url: schoolInfo.logoUrl || schoolInfo.logo_url || '',
            campus_image_url: schoolInfo.campusImageUrl || schoolInfo.campus_image_url || '',
          }
          // Set preview URLs - use the public URLs from response
          logoPreview.value = schoolInfo.logoUrl || schoolInfo.logo_url || ''
          welcomeImagePreview.value = schoolInfo.campusImageUrl || schoolInfo.campus_image_url || ''
          
          // Update localStorage and schoolData composable with school _id for save operations
          if (schoolInfo._id) {
            const updatedSchool = { ...schoolData.value, ...schoolInfo }
            schoolData.value = updatedSchool
            LocalStorageService.saveSchoolData(updatedSchool)
          }
        }
      } catch (err) {
        console.error('Error loading school data:', err)
        errorMessage.value = err.response?.data?.message || 'Failed to load school data'
      } finally {
        loading.value = false
      }
    }

    // Handle file selection
    const handleFileSelect = async (event, field) => {
      const file = event.target.files[0]
      if (!file) return

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        errorMessage.value = 'Only JPEG, PNG, and WebP images are allowed'
        event.target.value = ''
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        errorMessage.value = 'Image must be 5 MB or smaller'
        event.target.value = ''
        return
      }

      // Set preview immediately
      if (field === 'logo') {
        logoFile.value = file
        logoPreview.value = URL.createObjectURL(file)
      } else if (field === 'welcome') {
        welcomeImageFile.value = file
        welcomeImagePreview.value = URL.createObjectURL(file)
      }
      errorMessage.value = ''

      // Auto-upload the image
      try {
        uploading.value = true
        const asset = field === 'logo' ? 'logo' : 'welcome-image'
        const response = await uploadBranding(asset, file)
        
        if (response.success) {
          successMessage.value = `${field === 'logo' ? 'Logo' : 'Welcome image'} uploaded successfully!`
          // Don't auto-clear - let user dismiss (like srms-admin pattern)
          
          // Update form with the uploaded URL from response
          if (response.data?.url) {
            if (field === 'logo') {
              form.value.logo_url = response.data.url
            } else {
              form.value.campus_image_url = response.data.url
            }
          }
        }
      } catch (err) {
        console.error('Error uploading image:', err)
        errorMessage.value = 'Failed to upload image: ' + (err.response?.data?.message || err.message)
        // Revert preview on error
        if (field === 'logo') {
          logoPreview.value = form.value.logo_url || ''
          logoFile.value = null
        } else {
          welcomeImagePreview.value = form.value.campus_image_url || ''
          welcomeImageFile.value = null
        }
      } finally {
        uploading.value = false
        event.target.value = ''
      }
    }

    // Upload branding image
    const uploadBranding = async (asset, file) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await api.post(`/admin/school/branding/${asset}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    }

    // Delete branding image
    const deleteBranding = async (asset) => {
      await api.delete(`/admin/school/branding/${asset}`)
    }

    // Save school data
    const saveSchoolData = async () => {
      try {
        saving.value = true
        errorMessage.value = ''
        successMessage.value = ''

        const schoolId = user.value?.school_id || schoolData.value?._id
        if (!schoolId) {
          errorMessage.value = 'School ID not found'
          return
        }

        // Use admin/school endpoint
        const response = await api.put(`/admin/school/${schoolId}`, form.value)

        if (response.data.success) {
          successMessage.value = 'School profile updated successfully!'

          
          // Update local storage
          const updatedSchool = {
            ...schoolData.value,
            ...form.value,
          }
          LocalStorageService.saveSchoolData(updatedSchool)

          editMode.value = false
        }
      } catch (err) {
        console.error('Error saving school data:', err)
        errorMessage.value = err.response?.data?.message || 'Failed to save school profile'
      } finally {
        saving.value = false
        uploading.value = false
      }
    }

    // Reset form
    const resetForm = () => {
      loadSchoolData()
      editMode.value = false
      errorMessage.value = ''
      logoFile.value = null
      welcomeImageFile.value = null
      logoPreview.value = form.value.logo_url || ''
      welcomeImagePreview.value = form.value.campus_image_url || ''
    }

    // Toggle edit mode
    const toggleEditMode = () => {
      if (editMode.value) {
        resetForm()
      } else {
        editMode.value = true
      }
    }

    // Remove uploaded file
    const removeFile = (field) => {
      if (field === 'logo') {
        logoFile.value = null
        logoPreview.value = form.value.logo_url || ''
      } else if (field === 'welcome') {
        welcomeImageFile.value = null
        welcomeImagePreview.value = form.value.campus_image_url || ''
      }
    }

    // Delete branding from server
    const deleteBrandingAsset = async (asset) => {
      try {
        await deleteBranding(asset)
        if (asset === 'logo') {
          logoPreview.value = ''
          form.value.logo_url = ''
        } else if (asset === 'welcome') {
          welcomeImagePreview.value = ''
          form.value.campus_image_url = ''
        }
        successMessage.value = `${asset === 'logo' ? 'Logo' : 'Welcome image'} removed successfully`
        setTimeout(() => { successMessage.value = '' }, 3000)
      } catch (err) {
        console.error('Error deleting branding:', err)
        errorMessage.value = 'Failed to remove image'
      }
    }

    onMounted(() => {
      loadSchoolData()
    })

    return {
      loading,
      saving,
      uploading,
      successMessage,
      errorMessage,
      editMode,
      form,
      logoFile,
      welcomeImageFile,
      logoPreview,
      welcomeImagePreview,
      loadSchoolData,
      saveSchoolData,
      resetForm,
      toggleEditMode,
      handleFileSelect,
      removeFile,
      deleteBrandingAsset,
    }
  }
}
