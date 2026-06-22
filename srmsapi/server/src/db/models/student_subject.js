"use strict";
module.exports = (sequelize, DataTypes) => {
  const StudentSubject = sequelize.define(
    "StudentSubject",
    {
      student_id: { type: DataTypes.INTEGER, allowNull: false },
      subject_id: { type: DataTypes.INTEGER, allowNull: false },
      school_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "student_subjects",
      underscored: true,
      timestamps: true,
    }
  );

  StudentSubject.associate = (models) => {
    StudentSubject.belongsTo(models.Student, { foreignKey: "student_id", as: "student" });
    StudentSubject.belongsTo(models.Subject, { foreignKey: "subject_id", as: "subject" });
    if (models.AcademicYear) {
      StudentSubject.belongsTo(models.AcademicYear, { foreignKey: "academic_year_id", as: "academic_year" });
    }
  };

  return StudentSubject;
};
