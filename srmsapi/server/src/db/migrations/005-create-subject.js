"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("subjects", {
      id:           { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      subject_name: { type: Sequelize.STRING, allowNull: false },
      subject_code: { type: Sequelize.STRING }, // unique per school
      has_theory:   { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      has_lab:      { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      has_attendance: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      has_activity: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      school_id:    {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "schools", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
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

    await queryInterface.addIndex("subjects", ["school_id", "subject_code"], {
      unique: true,
      name: "uq_subjects_school_code",
    });
    await queryInterface.addIndex("subjects", ["school_id", "subject_name"], {
      name: "ix_subjects_school_name",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("subjects");
  },
};
