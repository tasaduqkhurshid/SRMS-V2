"use strict";
module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define(
    "Student",
    {
      roll_number: { type: DataTypes.STRING, allowNull: false },
      name:        { type: DataTypes.STRING, allowNull: false },
      class:       { type: DataTypes.STRING },
      section:     { type: DataTypes.STRING },
      gender:      { type: DataTypes.STRING },
      dob:         { type: DataTypes.DATEONLY },
      admission_number: { type: DataTypes.STRING },
  father_name: { type: DataTypes.STRING },
  mother_name: { type: DataTypes.STRING },
  address: { type: DataTypes.TEXT },
  pincode: { type: DataTypes.STRING },
      school_id:   { type: DataTypes.INTEGER, allowNull: false },      academic_year_id: { type: DataTypes.INTEGER, allowNull: true },    },
    {
      tableName: "students",
      underscored: true,
      timestamps: true,
    }
  );

  Student.associate = (models) => {
    // associate to the canonical School model
    Student.belongsTo(models.School, { foreignKey: "school_id", as: "school" });
    // results relation (optional to define here)
    if (models.Result) {
      Student.hasMany(models.Result, { foreignKey: "student_id", as: "results" });
    }
    if (models.AcademicYear) {
      Student.belongsTo(models.AcademicYear, { foreignKey: "academic_year_id", as: "academic_year" });
    }
  };

  return Student;
};
