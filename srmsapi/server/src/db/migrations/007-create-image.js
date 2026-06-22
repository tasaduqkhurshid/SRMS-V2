"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("images", {
      id:          { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      entity:      { type: Sequelize.STRING, allowNull: false },  // 'SCHOOL' | 'STUDENT'
      entity_id:   { type: Sequelize.INTEGER, allowNull: false }, // linked record id
      entity_type: { type: Sequelize.STRING, allowNull: false },  // 'LOGO' | 'PROFILE'
      image_data:  { type: Sequelize.BLOB("long"), allowNull: false },
      file_name:   { type: Sequelize.STRING },
      mime_type:   { type: Sequelize.STRING },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("images", ["entity", "entity_type", "entity_id"], {
      name: "ix_images_entity_type_id",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("images");
  },
};
