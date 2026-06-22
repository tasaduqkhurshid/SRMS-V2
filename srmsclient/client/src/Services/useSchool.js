/**
 * useSchool Composable
 * Vue 3 composable for accessing and managing school data
 * Provides reactive access to cached school data from local storage
 */

import { ref, computed, onMounted } from 'Vue'
import LocalStorageService from '../Services/LocalStorageService.js'

export function useSchool() {
  // Reactive state
  const schoolData = ref(null)
  const schoolLogo = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Load school data from local storage
   */
  const loadSchoolData = () => {
    try {
      isLoading.value = true
      error.value = null

      const data = LocalStorageService.getSchoolData()
      if (data) {
        schoolData.value = data
        console.log('School data loaded from local storage:', data)
      } else {
        error.value = 'School data not found in local storage'
        console.warn('School data not found')
      }

      // Try to load logo
      const logo = LocalStorageService.getSchoolLogo()
      if (logo) {
        schoolLogo.value = logo
      }
    } catch (err) {
      error.value = err.message
      console.error('Error loading school data:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Save school data to local storage
   */
  const saveSchoolData = (data) => {
    try {
      LocalStorageService.saveSchoolData(data)
      schoolData.value = data
      console.log('School data saved:', data)
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error saving school data:', err)
      return false
    }
  }

  /**
   * Save school logo
   */
  const saveSchoolLogo = (logoDataUrl) => {
    try {
      LocalStorageService.saveSchoolLogo(logoDataUrl)
      schoolLogo.value = logoDataUrl
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error saving school logo:', err)
      return false
    }
  }

  /**
   * Clear school data
   */
  const clearSchoolData = () => {
    try {
      LocalStorageService.clearSchoolData()
      schoolData.value = null
      schoolLogo.value = null
      console.log('School data cleared')
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error clearing school data:', err)
      return false
    }
  }

  // Computed properties
  const schoolName = computed(() => schoolData.value?.name || '')
  const schoolEmail = computed(() => schoolData.value?.email || '')
  const schoolPhone = computed(() => schoolData.value?.phone || '')
  const schoolAbbreviation = computed(() => schoolData.value?.abbreviation || '')
  const schoolLogoUrl = computed(() => schoolData.value?.logo_url || schoolLogo.value || '')
  const principalName = computed(() => schoolData.value?.principal_name || '')
  const schoolBoard = computed(() => schoolData.value?.board || '')

  // Load data on mount
  onMounted(() => {
    loadSchoolData()
  })

  return {
    // State
    schoolData,
    schoolLogo,
    isLoading,
    error,

    // Methods
    loadSchoolData,
    saveSchoolData,
    saveSchoolLogo,
    clearSchoolData,

    // Computed
    schoolName,
    schoolEmail,
    schoolPhone,
    schoolAbbreviation,
    schoolLogoUrl,
    principalName,
    schoolBoard,
  }
}
