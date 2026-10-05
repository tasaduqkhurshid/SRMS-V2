const ProfileService = require('../../services/student/profile.service');

const getProfile = async (req, res) => {
  try {
    const profile = await ProfileService.getProfile(req.user);
    if (!profile) {
      return res.status(404).json({ status: 'error', message: 'Student profile not found' });
    }
    return res.status(200).json({ status: 'success', data: profile });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Unable to fetch student profile', error: error.message });
  }
};

module.exports = { getProfile };
