const LecturesService = require('../../services/student/lectures.service');

const getLectures = async (req, res) => {
  try {
    const lectures = await LecturesService.getLectures(req.user);
    return res.status(200).json({ status: 'success', data: lectures });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Unable to fetch lectures', error: error.message });
  }
};

module.exports = { getLectures };
