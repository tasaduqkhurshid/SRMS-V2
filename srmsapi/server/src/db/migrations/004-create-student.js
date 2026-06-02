"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("students", {
      id:               { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      roll_number:      { type: Sequelize.STRING, allowNull: false },
      name:             { type: Sequelize.STRING, allowNull: false },
      class:            { type: Sequelize.STRING },
      section:          { type: Sequelize.STRING },
      gender:           { type: Sequelize.STRING },
      dob:              { type: Sequelize.DATEONLY },
      admission_number: { type: Sequelize.STRING },
      father_name:      { type: Sequelize.STRING },
      mother_name:      { type: Sequelize.STRING },
      address:          { type: Sequelize.TEXT },
      pincode:          { type: Sequelize.STRING },
      school_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "schools", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      academic_year_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "academic_years", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      // Use CURRENT_TIMESTAMP for SQLite (NOT NOW())
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

    // Unique roll per school
    await queryInterface.addIndex("students", ["school_id", "roll_number"], {
      unique: true,
      name: "uq_students_school_roll",
    });

    await queryInterface.addIndex("students", ["school_id", "class", "section"], {
      name: "ix_students_class_section",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("students");
  },
};
