"use strict";

const {ACADEMIC_YEARS} = require('../../constants/tableNames');

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) create academic_years table
    await queryInterface.createTable(ACADEMIC_YEARS, {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false }, // e.g. "2025-2026"
      start_date: { type: Sequelize.DATEONLY, allowNull: true },
      end_date: { type: Sequelize.DATEONLY, allowNull: true },
      school_id: { type: Sequelize.INTEGER, allowNull: false },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {

    await queryInterface.dropTable(ACADEMIC_YEARS);
  }
};
