"use strict";

const { success } = require("../../utils/serviceResult");

const getNotes = async () => {
  return success({ items: [] });
};

module.exports = { getNotes };