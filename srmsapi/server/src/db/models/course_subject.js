"use strict";
module.exports = (sequelize, DataTypes) => {
  const CourseSubject = sequelize.define(
    "CourseSubject",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      course_id: { type: DataTypes.INTEGER, allowNull: false },
      subject_id: { type: DataTypes.INTEGER, allowNull: false },
      school_id: { type: DataTypes.INTEGER, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "course_subjects",
      underscored: true,
      timestamps: false,
    }
  );

  CourseSubject.associate = function (models) {
    CourseSubject.belongsTo(models.Course, { foreignKey: "course_id", as: "course" });
    CourseSubject.belongsTo(models.Subject, { foreignKey: "subject_id", as: "subject" });
  };

  return CourseSubject;
};
