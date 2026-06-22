"use strict";
module.exports = {
  async up(q, Sequelize) {
    await q.createTable("users", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      username: { type: Sequelize.STRING, unique: true },
      email: { type: Sequelize.STRING },
      password: Sequelize.STRING,
      pin: Sequelize.STRING,
      role: Sequelize.STRING,
      school_id: {
        type: Sequelize.INTEGER,
        references: { model: "schools", key: "id" },
        onDelete: "CASCADE",
      },
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
  },
  async down(q) {
    await q.dropTable("users");
  },
};
