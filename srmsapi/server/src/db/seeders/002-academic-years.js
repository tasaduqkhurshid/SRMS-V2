"use strict";
const { AcademicYear } = require("../models");

module.exports = {
  async up () {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear;
    const endYear = currentYear + 1;
    
    // Create/Update Academic Years
    await AcademicYear.bulkCreate(
      [
        {
          name: `${startYear}-${endYear}`,
          start_date: `${startYear}-04-01`,  // Academic year typically starts in April
          end_date: `${endYear}-03-31`,      // Ends in March
          school_id: 1001,
        },
      ],
      {
        updateOnDuplicate: ["name", "start_date", "end_date"]
      }
    );
  },

  async down (q) {
    await q.bulkDelete("academic_years", { school_id: 1001 });
  }
};
