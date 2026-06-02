"use strict";
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define(
    "Course",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      course_name: { type: DataTypes.STRING, allowNull: false },
      course_code: { type: DataTypes.STRING, allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      school_id: { type: DataTypes.INTEGER, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "courses",
      underscored: true,
      timestamps: false,
    }
  );

  Course.associate = function (models) {
    Course.belongsTo(models.School, { foreignKey: "school_id", as: "school" });
    Course.belongsToMany(models.Subject, {
      through: models.CourseSubject || models.course_subjects,
      foreignKey: "course_id",
      otherKey: "subject_id",
      as: "subjects",
    });
  };

  return Course;
};
