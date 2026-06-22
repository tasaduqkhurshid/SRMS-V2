"use strict";
module.exports = (sequelize, DataTypes) => {
  const AcademicYear = sequelize.define(
    "AcademicYear",
    {
      name: { type: DataTypes.STRING, allowNull: false },
      start_date: { type: DataTypes.DATEONLY },
      end_date: { type: DataTypes.DATEONLY },
      school_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "academic_years",
      underscored: true,
      timestamps: true,
    }
  );

  AcademicYear.associate = (models) => {
    if (models.Exam) {
      AcademicYear.hasMany(models.Exam, { foreignKey: "academic_year_id", as: "exams" });
    }
    if (models.Student) {
      AcademicYear.hasMany(models.Student, { foreignKey: "academic_year_id", as: "students" });
    }
    if (models.Result) {
      AcademicYear.hasMany(models.Result, { foreignKey: "academic_year_id", as: "results" });
    }
    if (models.StudentSubject) {
      AcademicYear.hasMany(models.StudentSubject, { foreignKey: "academic_year_id", as: "student_subjects" });
    }
  };

  return AcademicYear;
};
