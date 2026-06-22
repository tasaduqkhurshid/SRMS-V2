"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("exams", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      exam_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      max_marks: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100,
      },
      school_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "schools",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      academic_year_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "academic_years",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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

    await queryInterface.addIndex("exams", ["school_id", "exam_name"], {
      unique: true,
      name: "uq_exams_school_name",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("exams");
  },
};
