const FeesService = require('../../services/student/fees.service');

const getFees = async (req, res) => {
  try {
    const fees = await FeesService.getFees(req.user);
    return res.status(200).json({ status: 'success', data: fees });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Unable to fetch fee information', error: error.message });
  }
};

module.exports = { getFees };
