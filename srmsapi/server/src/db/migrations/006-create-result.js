"use strict";

module.exports = {

  async up(queryInterface, Sequelize) {

    const transaction = await queryInterface.sequelize.transaction();

    try {

      await queryInterface.createTable(
        "results",
        {

          id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },

          student_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: "students",
              key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE"
          },

          subject_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: "subjects",
              key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE"
          },

          exam_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: "exams",
              key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE"
          },

          academic_year_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: "academic_years",
              key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE"
          },

          theory_marks: {
            type: Sequelize.INTEGER,
            allowNull: true
          },

          lab_marks: {
            type: Sequelize.INTEGER,
            allowNull: true
          },

          attendance_marks: {
            type: Sequelize.INTEGER,
            allowNull: true
          },

          activity_marks: {
            type: Sequelize.INTEGER,
            allowNull: true
          },

          total_marks: {
            type: Sequelize.INTEGER,
            allowNull: true
          },

          created_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
          },

          updated_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
          }

        },
        { transaction }
      );

      /* Composite Unique Constraint
         Prevents duplicate results for same student + subject + exam + academic_year
      */

      await queryInterface.addConstraint("results", {
        fields: ["student_id", "subject_id", "exam_id", "academic_year_id"],
        type: "unique",
        name: "uq_results_student_subject_exam_year",
        transaction
      });

      /* Helpful indexes for faster queries */

      await queryInterface.addIndex(
        "results",
        ["student_id"],
        { name: "idx_results_student_id", transaction }
      );

      await queryInterface.addIndex(
        "results",
        ["subject_id"],
        { name: "idx_results_subject_id", transaction }
      );

      await queryInterface.addIndex(
        "results",
        ["exam_id"],
        { name: "idx_results_exam_id", transaction }
      );

      await queryInterface.addIndex(
        "results",
        ["academic_year_id"],
        { name: "idx_results_academic_year_id", transaction }
      );

      await transaction.commit();

    } catch (error) {

      await transaction.rollback();
      throw error;

    }

  },

  async down(queryInterface, Sequelize) {

    const transaction = await queryInterface.sequelize.transaction();

    try {

      await queryInterface.dropTable("results", { transaction });

      await transaction.commit();

    } catch (error) {

      await transaction.rollback();
      throw error;

    }

  }

};