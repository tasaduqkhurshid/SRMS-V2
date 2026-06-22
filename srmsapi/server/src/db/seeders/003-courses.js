"use strict";
const TABLES = require("../../constants/tableNames");
const gm = require("../helpers/genericMigrationQueries");

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const courses = [
      {
        id: 1000,
        course_name: "Pre Nursery",
        course_code: "pre_nursery",
        description: "Pre Nursery ",
        created_at: now,
        updated_at: now
      },
      {
        id: 10001,
        course_name: "Nursery",
        course_code: "nursery",
        description: "Nursery ",
        created_at: now,
        updated_at: now
      },
      {
        id: 10002,
        course_name: "L.K.G",
        course_code: "lkg_pry",
        description: "Lower Kindergarten",
        created_at: now,
        updated_at: now
      },
      {
        id: 10003,
        course_name: "U.K.G",
        course_code: "ukg_pry",
        description: "Upper Kindergarten",
        created_at: now,
        updated_at: now
      },

      {
        id: 10004,
        course_name: "1st",
        course_code: "1st_pry",
        description: "1st Pry",
      },
      {
        id: 10005,
        course_name: "2nd",
        course_code: "2nd_pry",
        description: "2nd Pry",
      },
      {
        id: 10006,
        course_name: "3rd",
        course_code: "3rd_pry",
        description: "3rd Pry",
      },
      {
        id: 10007,
        course_name: "4th",
        course_code: "4th_pry",
        description: "4th Pry",
      },
      {
        id: 10008,
        course_name: "5th",
        course_code: "5th_grade",
        description: "5th Grade",
      },
      {
        id: 10009,
        course_name: "6th",
        course_code: "6th_grade",
        description: "6th Grade",
      },
      {
        id: 10010,
        course_name: "7th",
        course_code: "7th_grade",
        description: "7th Grade",
      },
      {
        id: 10011,
        course_name: "8th",
        course_code: "8th_grade",
        description: "8th Grade",
      },
      {
        id: 10012,
        course_name: "9th",
        course_code: "9th_grade",
        description: "9th Grade",
      },
      {
        id: 10013,
        course_name: "10th",
        course_code: "10th_grade",
        description: "10th Grade",
        created_at: now,
        updated_at: now
      },
    ];

    await gm.bulkUpsert(queryInterface, TABLES.COURSES, courses, ["course_name", "course_code", "description", "updated_at"]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(TABLES.COURSES, { id: [1000,10001,10002,10003,10004,10005,10006,10007,10008,10009,10010,10011,10012,10013] }, {});
  },
};
