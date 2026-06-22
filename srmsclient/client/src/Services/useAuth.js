/**
 * useAuth Composable
 * Vue 3 composable for authentication with session/local storage integration
 */

import { ref, computed } from 'Vue'
import { api } from '../Services/api.js'
import LocalStorageService from '../Services/LocalStorageService.js'

export function useAuth() {
  // Reactive state
  const user = ref(null)
  const token = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Login with username/email and password
   */
  const login = async (identifier, password) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await api.post('/auth/login', {
        username: identifier,
        email: identifier,
        password
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed')
      }

      const { token: authToken, user: userData, school: schoolData } = response.data.data

      // Save to local storage
      if (authToken) {
        LocalStorageService.saveAuthToken(authToken)
        token.value = authToken
      }

      if (userData) {
        LocalStorageService.saveUserData(userData)
        user.value = userData
      }

      if (schoolData) {
        LocalStorageService.saveSchoolData(schoolData)
      }

      console.log('Login successful, data saved to local storage')
      return { success: true, user: userData, school: schoolData }
    } catch (err) {
      error.value = err.message
      console.error('Login error:', err)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Login with PIN
   */
  const loginWithPin = async (email, pin) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await api.post('/auth/login-pin', { email, pin })

      if (!response.data.success) {
        throw new Error(response.data.message || 'PIN login failed')
      }

      const { token: authToken, user: userData, school: schoolData } = response.data.data

      // Save to local storage
      if (authToken) {
        LocalStorageService.saveAuthToken(authToken)
        token.value = authToken
      }

      if (userData) {
        LocalStorageService.saveUserData(userData)
        user.value = userData
      }

      if (schoolData) {
        LocalStorageService.saveSchoolData(schoolData)
      }

      console.log('PIN login successful, data saved to local storage')
      return { success: true, user: userData, school: schoolData }
    } catch (err) {
      error.value = err.message
      console.error('PIN login error:', err)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout
   */
  const logout = async () => {
    try {
      isLoading.value = true
      error.value = null

      // Call backend logout endpoint
      await api.post('/auth/logout')

      // Clear local storage
      LocalStorageService.clearAll()

      // Clear local state
      user.value = null
      token.value = null

      console.log('Logout successful, local storage cleared')
      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error('Logout error:', err)
      // Still clear local data even if backend call fails
      LocalStorageService.clearAll()
      user.value = null
      token.value = null
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load auth data from local storage (on app init)
   */
  const loadAuthData = () => {
    try {
      const userData = LocalStorageService.getUserData()
      const authToken = LocalStorageService.getAuthToken()

      if (userData) {
        user.value = userData
      }

      if (authToken) {
        token.value = authToken
      }

      return { user: userData, token: authToken }
    } catch (err) {
      error.value = err.message
      console.error('Error loading auth data:', err)
      return { user: null, token: null }
    }
  }

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = computed(() => {
    return !!token.value && !!user.value
  })

  return {
    // State
    user,
    token,
    isLoading,
    error,

    // Methods
    login,
    loginWithPin,
    logout,
    loadAuthData,

    // Computed
    isAuthenticated,
  }
}
