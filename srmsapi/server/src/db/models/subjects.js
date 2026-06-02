"use strict";
module.exports = (sequelize, DataTypes) => {
  const Subject = sequelize.define(
    "Subject",
    {
      subject_name: { type: DataTypes.STRING, allowNull: false },
      subject_code: { type: DataTypes.STRING }, // unique per school (see migration)
      has_theory:   { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      has_lab:      { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      has_attendance: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      has_activity: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      school_id:    { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "subjects",
      underscored: true,
      timestamps: true,
    }
  );

  Subject.associate = (models) => {
    // associate to the canonical School model
    Subject.belongsTo(models.School, { foreignKey: "schoolId", as: "school" });
    if (models.Result) {
      Subject.hasMany(models.Result, { foreignKey: "subject_id", as: "results" });
    }
  };

  return Subject;
};
