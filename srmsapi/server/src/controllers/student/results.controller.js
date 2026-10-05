const ResultsService = require('../../services/student/results.service');

const getResults = async (req, res) => {
  try {
    const results = await ResultsService.getResults(req.user);
    return res.status(200).json({ status: 'success', data: results });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Unable to fetch student results', error: error.message });
  }
};

module.exports = { getResults };
