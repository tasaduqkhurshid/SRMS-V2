/**
 * Session Store Utility
 * Manages server-side session data for schools, user sessions, etc.
 */

class SessionStore {
  /**
   * Store school data in user session
   * Called after successful login
   */
  static storeSchoolInSession(req, schoolData) {
    if (!req.session) {
      req.session = {};
    }

    req.session.school = {
      id: schoolData.id,
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
      logo_data: schoolData.logo_data || null, // BLOB if available
      website: schoolData.website || null,
      principal_name: schoolData.principal_name || null,
      principal_email: schoolData.principal_email || null,
      year_established: schoolData.year_established || null,
      board: schoolData.board || null,
      timestamp: Date.now(),
    };
  }

  /**
   * Get school data from session
   */
  static getSchoolFromSession(req) {
    return (req.session && req.session.school) || null;
  }

  /**
   * Store user auth data in session
   */
  static storeUserInSession(req, userData) {
    if (!req.session) {
      req.session = {};
    }

    req.session.user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      school_id: userData.school_id,
      timestamp: Date.now(),
    };
  }

  /**
   * Get user from session
   */
  static getUserFromSession(req) {
    return (req.session && req.session.user) || null;
  }

  /**
   * Clear session data
   */
  static clearSession(req) {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error clearing session:', err);
        }
      });
    }
  }

  /**
   * Get all session data
   */
  static getSessionData(req) {
    return {
      user: SessionStore.getUserFromSession(req),
      school: SessionStore.getSchoolFromSession(req),
      timestamp: (req.session && req.session.timestamp) || null,
    };
  }

  /**
   * Check if session is valid (not expired)
   * Session expiry can be customized based on requirements
   */
  static isSessionValid(req, maxAgeMs = 24 * 60 * 60 * 1000) {
    const session = req.session;
    if (!session) return false;

    const timestamp = session.timestamp || 0;
    const age = Date.now() - timestamp;

    return age < maxAgeMs;
  }
}

module.exports = SessionStore;
