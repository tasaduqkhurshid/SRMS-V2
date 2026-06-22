"use strict";
module.exports = (sequelize, DataTypes) => {
  const School = sequelize.define(
    "School",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      school_name: DataTypes.STRING,
      name: DataTypes.STRING, // alias for school_name
      school_code: { type: DataTypes.STRING, unique: true },
      abbreviation: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      contact_number: DataTypes.STRING, // alias for phone
      address: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      pincode: DataTypes.STRING,
      logo_path: DataTypes.STRING,
      logo_url: DataTypes.STRING,
      website: DataTypes.STRING,
      principal_name: DataTypes.STRING,
      principal_email: DataTypes.STRING,
      year_established: DataTypes.INTEGER,
      board: DataTypes.STRING,
    },
    {
      tableName: "schools",
      underscored: true,
      timestamps: true,
    }
  );
  School.associate = (models) => {
    School.hasMany(models.User);
    School.hasMany(models.Exam);
  };
  return School;
};
