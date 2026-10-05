const AuthService = require('../../services/student/auth.service');

const manifest = (req, res) => {
  if (!req.school) return res.status(404).json({ status: 'error', message: 'School hostname not found' });
  const name = `${req.school.name || req.school.school_name} Student Portal`;
  res.set('Cache-Control', 'private, no-store');
  return res.json({
    name,
    short_name: req.school.abbreviation || req.school.slug,
    start_url: '/login',
    scope: '/',
    display: 'standalone',
    background_color: '#f3f7fb',
    theme_color: '#1d4ed8',
    icons: [{ src: '/portal-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
  });
};

const getSchoolBrand = async (req, res) => {
  try {
    const school = await AuthService.getSchoolBrand(req.school);
    if (!school) {
      return res.status(404).json({ status: 'error', success: false, message: 'School not found' });
    }
    res.set('Cache-Control', 'private, no-store');
    return res.status(200).json({ status: 'success', success: true, data: school });
  } catch (error) {
    return res.status(500).json({ status: 'error', success: false, message: 'Unable to load school branding' });
  }
};

const login = async (req, res) => {
  try {
    const { studentId, password } = req.body || {};
    const payload = await AuthService.login({ studentId, password, school: req.school });
    if (!payload) {
      return res.status(401).json({ status: 'error', success: false, message: 'Invalid credentials' });
    }
    return res.status(200).json({ status: 'success', success: true, data: payload });
  } catch (error) {
    return res.status(500).json({ status: 'error', success: false, message: 'Student login failed', error: error.message });
  }
};

const logout = async (_req, res) => {
  return res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

const me = async (req, res) => {
  try {
    const profile = await AuthService.me(req.user);
    return res.status(200).json({ status: 'success', data: profile });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Unable to load current student', error: error.message });
  }
};

module.exports = { manifest, getSchoolBrand, login, logout, me };
