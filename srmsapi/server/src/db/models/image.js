"use strict";
module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define(
    "Image",
    {
      entity:      { type: DataTypes.STRING, allowNull: false }, // 'SCHOOL' | 'STUDENT'
      entity_id:   { type: DataTypes.INTEGER, allowNull: false }, // linked record id
      entity_type: { type: DataTypes.STRING, allowNull: false }, // 'LOGO' | 'PROFILE'
      image_data:  { type: DataTypes.BLOB("long"), allowNull: false },
      file_name:   { type: DataTypes.STRING },
      mime_type:   { type: DataTypes.STRING },
      // optional school scoping (if you want)
      // school_id:   { type: DataTypes.INTEGER },
    },
    {
      tableName: "images",
      underscored: true,
      timestamps: true,
    }
  );

  // Polymorphic; no hard FK here to keep it flexible
  return Image;
};
