"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('course_subjects', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      course_id: { type: Sequelize.INTEGER, allowNull: false },
      subject_id: { type: Sequelize.INTEGER, allowNull: false },
      school_id: { type: Sequelize.INTEGER, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('course_subjects', ['course_id']);
    await queryInterface.addIndex('course_subjects', ['subject_id']);
    await queryInterface.addIndex('course_subjects', ['course_id','subject_id'], { unique: true, name: 'ux_course_subject_course_subject' });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('course_subjects');
  }
};
