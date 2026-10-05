const DashboardService = require('../../services/student/dashboard.service');

const getDashboard = async (req, res) => {
  try {
    const dashboard = await DashboardService.getDashboard(req.user);
    if (!dashboard) {
      return res.status(404).json({ status: 'error', message: 'Student dashboard not found' });
    }
    return res.status(200).json({ status: 'success', data: dashboard });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Unable to fetch student dashboard', error: error.message });
  }
};

module.exports = { getDashboard };
