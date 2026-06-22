"use strict";

module.exports = (sequelize, DataTypes) => {

  const Result = sequelize.define(
    "Result",
    {
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      exam_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      academic_year_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      theory_marks: {
        type: DataTypes.INTEGER
      },

      lab_marks: {
        type: DataTypes.INTEGER
      },

      attendance_marks: {
        type: DataTypes.INTEGER
      },

      activity_marks: {
        type: DataTypes.INTEGER
      },

      total_marks: {
        type: DataTypes.INTEGER
      }
    },
    {
      tableName: "results",
      underscored: true,
      timestamps: true,

      indexes: [
        {
          unique: true,
          name: "unique_student_subject_exam_year",
          fields: ["student_id", "subject_id", "exam_id", "academic_year_id"]
        }
      ]
    }
  );

  Result.associate = (models) => {

    if (models.Student) {
      Result.belongsTo(models.Student, {
        foreignKey: "student_id",
        as: "student"
      });
    }

    if (models.Subject) {
      Result.belongsTo(models.Subject, {
        foreignKey: "subject_id",
        as: "subject"
      });
    }

    if (models.Exam) {
      Result.belongsTo(models.Exam, {
        foreignKey: "exam_id",
        as: "exam"
      });
    }

    if (models.AcademicYear) {
      Result.belongsTo(models.AcademicYear, {
        foreignKey: "academic_year_id",
        as: "academic_year"
      });
    }
  };

  return Result;
};