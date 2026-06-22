"use strict";
module.exports = (sequelize, DataTypes) => {
  const MarksheetTemplate = sequelize.define(
    "MarksheetTemplate",
    {
      name: { type: DataTypes.STRING, allowNull: false }, // e.g., "Professional", "Simple", "Detailed"
      html_content: { type: DataTypes.TEXT, allowNull: false }, // HTML template with placeholders like {{student_name}}, {{marks}}, etc.
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false }, // Enable/disable template
      school_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "marksheet_templates",
      underscored: true,
      timestamps: true,
    }
  );

  MarksheetTemplate.associate = (models) => {
    if (models.School) {
      MarksheetTemplate.belongsTo(models.School, { foreignKey: "school_id", as: "school" });
    }
  };

  return MarksheetTemplate;
};
