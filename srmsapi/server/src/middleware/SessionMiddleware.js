/**
 * Session Middleware
 * Attaches session data to requests and responses
 */

const SessionStore = require('../utils/SessionStore');

/**
 * Middleware to attach school data from session to response locals
 * Usage: app.use(sessionDataMiddleware)
 */
const sessionDataMiddleware = (req, res, next) => {
  try {
    // Attach session data to res.locals for use in responses
    const sessionData = SessionStore.getSessionData(req);
    
    res.locals.school = sessionData.school;
    res.locals.user = sessionData.user;
    res.locals.isSessionValid = SessionStore.isSessionValid(req);

    // Optionally attach to req for use in controllers
    req.schoolData = sessionData.school;
    req.userData = sessionData.user;

    next();
  } catch (error) {
    console.error('Error in sessionDataMiddleware:', error);
    next();
  }
};

/**
 * Middleware to validate session on protected routes
 * Usage: app.get('/protected', requireSession, controller)
 */
const requireSession = (req, res, next) => {
  const sessionData = SessionStore.getSessionData(req);

  if (!sessionData.user || !sessionData.school) {
    return res.status(401).json({
      success: false,
      error: 'Session expired or invalid. Please login again.',
    });
  }

  if (!SessionStore.isSessionValid(req)) {
    return res.status(401).json({
      success: false,
      error: 'Session expired. Please login again.',
    });
  }

  next();
};

/**
 * Middleware to attach school data to request body for logging/tracking
 */
const attachSchoolContext = (req, res, next) => {
  try {
    const school = SessionStore.getSchoolFromSession(req);
    if (school) {
      req.body = req.body || {};
      req.body._school_id = school.id;
      req.body._school_name = school.name;
    }
    next();
  } catch (error) {
    console.error('Error in attachSchoolContext:', error);
    next();
  }
};

module.exports = {
  sessionDataMiddleware,
  requireSession,
  attachSchoolContext,
};
