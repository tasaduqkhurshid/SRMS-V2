"use strict";
const TABLES = require("../../constants/tableNames");
const gm = require("../helpers/genericMigrationQueries");

module.exports = {
  async up(queryInterface, Sequelize) {
    const sid = 1001; // seeded school id used earlier; can be changed
    const now = new Date();
    const records = [
      { exam_name: "F1", max_marks: 20, school_id: sid, created_at: now, updated_at: now },
      { exam_name: "F2", max_marks: 20, school_id: sid, created_at: now, updated_at: now },
      { exam_name: "F3", max_marks: 20, school_id: sid, created_at: now, updated_at: now },
      { exam_name: "F4", max_marks: 20, school_id: sid, created_at: now, updated_at: now },
      { exam_name: "F5", max_marks: 20, school_id: sid, created_at: now, updated_at: now },
      { exam_name: "F6", max_marks: 20, school_id: sid, created_at: now, updated_at: now },
      { exam_name: "SA", max_marks: 80, school_id: sid, created_at: now, updated_at: now }
    ];

    await gm.bulkUpsert(queryInterface, TABLES.EXAMS, records, ["max_marks", "school_id", "updated_at"]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(TABLES.EXAMS, { school_id: 1001 }, {});
  },
};
