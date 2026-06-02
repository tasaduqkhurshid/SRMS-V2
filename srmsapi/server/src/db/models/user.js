"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: { type: DataTypes.STRING, unique: true },
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      pin: DataTypes.STRING,
      role: DataTypes.STRING,
      school_id: DataTypes.INTEGER,
    },
    {
      tableName: "users",
      underscored: true,
      timestamps: true,
    }
  );
  User.associate = (models) => {
    // ✅ Establish relation
    User.belongsTo(models.School, { foreignKey: "school_id" });
  };
  return User;
};
