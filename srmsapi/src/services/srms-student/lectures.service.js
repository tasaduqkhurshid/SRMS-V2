"use strict";

const { success } = require("../../utils/serviceResult");

const getLectures = async () => {
  return success({ items: [] });
};

module.exports = { getLectures };