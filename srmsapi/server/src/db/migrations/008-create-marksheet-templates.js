"use strict";

const TABLES = require('../../constants/tableNames');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('marksheet_templates', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      html_content: { type: Sequelize.TEXT, allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false },
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
    await queryInterface.dropTable('marksheet_templates');
  }
};
