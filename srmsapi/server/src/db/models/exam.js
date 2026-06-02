"use strict";
module.exports = (sequelize, DataTypes) => {
  const Exam = sequelize.define(
    "Exam",
    {
      exam_name: { type: DataTypes.STRING, allowNull: false }, // e.g., F1, F2, SA
      max_marks: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 },
      school_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "exams",
      underscored: true,
      timestamps: true,
    }
  );

  Exam.associate = (models) => {
    if (models.School) {
      Exam.belongsTo(models.School, { foreignKey: "school_id", as: "school" });
    }
    if (models.AcademicYear) {
      Exam.belongsTo(models.AcademicYear, { foreignKey: "academic_year_id", as: "academic_year" });
    }
  };

  return Exam;
};
