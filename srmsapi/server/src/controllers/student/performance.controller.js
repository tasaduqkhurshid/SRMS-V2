const PerformanceService = require('../../services/student/performance.service');

const getPerformance = async (req, res) => {
  try {
    const performance = await PerformanceService.getPerformance(req.user);
    return res.status(200).json({ status: 'success', data: performance });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Unable to fetch performance data', error: error.message });
  }
};

module.exports = { getPerformance };
