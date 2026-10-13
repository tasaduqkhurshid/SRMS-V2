"use strict";

const NotesService = require("../../services/student/notes.service");
const { NotFoundError } = require("../../utils/applicationErrors");
const { asyncHandler } = require("../../middleware/errorHandler");
const { sendSuccessJsonResponse } = require("../../utils/responseHelpers");

const getNotes = asyncHandler(async (req, res, next) => {
  const result = await NotesService.getNotes(req.user);
  if (result.error) return next(result.error);
  if (!result.data) {
    throw new NotFoundError("Study notes");
  }
  return sendSuccessJsonResponse(res, { statusCode: 200, message: "Notes retrieved", data: result.data });
});

module.exports = { getNotes };