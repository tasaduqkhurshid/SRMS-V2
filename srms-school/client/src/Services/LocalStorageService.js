/**
 * Local Storage Utility
 * Manages browser local storage for school details, user preferences, etc.
 */

const STORAGE_KEYS = {
  SCHOOL: 'pwp_school_data',
  USER: 'pwp_user_data',
  AUTH_TOKEN: 'pwp_auth_token',
  CACHE_TIMESTAMP: 'pwp_cache_timestamp',
};

class LocalStorageService {
  /**
   * Save school data to local storage
   */
  static saveSchoolData(schoolData) {
    try {
      const data = {
        _id: schoolData._id,
        name: schoolData.name,
        abbreviation: schoolData.abbreviation || null,
        email: schoolData.email || null,
        phone: schoolData.phone || null,
        address: schoolData.address || null,
        city: schoolData.city || null,
        state: schoolData.state || null,
        pincode: schoolData.pincode || null,
        logo_path: schoolData.logo_path || null,
        logo_url: schoolData.logo_url || null,
        website: schoolData.website || null,
        principal_name: schoolData.principal_name || null,
        principal_email: schoolData.principal_email || null,
        year_established: schoolData.year_established || null,
        board: schoolData.board || null,
        timestamp: Date.now(),
      };

      localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(data));
      console.log('School data saved to local storage');
      return true;
    } catch (error) {
      console.error('Error saving school data to local storage:', error);
      return false;
    }
  }

  /**
   * Get school data from local storage
   */
  static getSchoolData() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHOOL);
      if (!data) return null;

      const schoolData = JSON.parse(data);
      if (!schoolData._id && schoolData.id) {
        schoolData._id = schoolData.id;
        delete schoolData.id;
        localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(schoolData));
      }
      return schoolData;
    } catch (error) {
      console.error('Error reading school data from local storage:', error);
      return null;
    }
  }

  /**
   * Save user data to local storage
   */
  static saveUserData(userData) {
    try {
      const data = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        school_id: userData.school_id,
        timestamp: Date.now(),
      };

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));
      console.log('User data saved to local storage');
      return true;
    } catch (error) {
      console.error('Error saving user data to local storage:', error);
      return false;
    }
  }

  /**
   * Get user data from local storage
   */
  static getUserData() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading user data from local storage:', error);
      return null;
    }
  }

  /**
   * Save auth token to local storage
   */
  static saveAuthToken(token) {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      return true;
    } catch (error) {
      console.error('Error saving auth token:', error);
      return false;
    }
  }

  /**
   * Get auth token from local storage
   */
  static getAuthToken() {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error reading auth token:', error);
      return null;
    }
  }

  /**
   * Save school logo as data URL to local storage (optional - for offline use)
   */
  static saveSchoolLogo(logoDataUrl) {
    try {
      if (!logoDataUrl) return false;
      // Only save if reasonable size (avoid bloating storage)
      if (logoDataUrl.length > 500 * 1024) { // 500KB limit
        console.warn('Logo data too large, skipping local storage save');
        return false;
      }
      localStorage.setItem(`${STORAGE_KEYS.SCHOOL}_logo`, logoDataUrl);
      return true;
    } catch (error) {
      console.error('Error saving school logo:', error);
      return false;
    }
  }

  /**
   * Get school logo from local storage
   */
  static getSchoolLogo() {
    try {
      return localStorage.getItem(`${STORAGE_KEYS.SCHOOL}_logo`);
    } catch (error) {
      console.error('Error reading school logo:', error);
      return null;
    }
  }

  /**
   * Clear school data (on logout)
   */
  static clearSchoolData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.SCHOOL);
      localStorage.removeItem(`${STORAGE_KEYS.SCHOOL}_logo`);
      return true;
    } catch (error) {
      console.error('Error clearing school data:', error);
      return false;
    }
  }

  /**
   * Clear user data (on logout)
   */
  static clearUserData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  }

  /**
   * Clear auth token (on logout)
   */
  static clearAuthToken() {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      return true;
    } catch (error) {
      console.error('Error clearing auth token:', error);
      return false;
    }
  }

  /**
   * Clear all user-related data (on logout)
   */
  static clearAll() {
    try {
      LocalStorageService.clearUserData();
      LocalStorageService.clearSchoolData();
      LocalStorageService.clearAuthToken();
      console.log('All local storage cleared');
      return true;
    } catch (error) {
      console.error('Error clearing all local storage:', error);
      return false;
    }
  }

  /**
   * Check if data is fresh (not expired)
   */
  static isDataFresh(maxAgeMs = 24 * 60 * 60 * 1000) {
    try {
      const schoolData = LocalStorageService.getSchoolData();
      if (!schoolData || !schoolData.timestamp) return false;

      const age = Date.now() - schoolData.timestamp;
      return age < maxAgeMs;
    } catch (error) {
      console.error('Error checking data freshness:', error);
      return false;
    }
  }

  /**
   * Get school name (quick access)
   */
  static getSchoolName() {
    const school = LocalStorageService.getSchoolData();
    return school?.name || 'School';
  }

  /**
   * Get school logo URL (quick access)
   */
  static getSchoolLogoUrl() {
    const school = LocalStorageService.getSchoolData();
    return school?.logo_url || null;
  }
}

export default LocalStorageService;
