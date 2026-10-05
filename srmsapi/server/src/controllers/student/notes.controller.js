const NotesService = require('../../services/student/notes.service');

const getNotes = async (req, res) => {
  try {
    const notes = await NotesService.getNotes(req.user);
    return res.status(200).json({ status: 'success', data: notes });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Unable to fetch study notes', error: error.message });
  }
};

module.exports = { getNotes };
