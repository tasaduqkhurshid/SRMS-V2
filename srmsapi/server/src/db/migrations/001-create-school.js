"use strict";
module.exports = {
  async up(q, Sequelize) {
    await q.createTable("schools", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      school_name: Sequelize.STRING,
      name: Sequelize.STRING,
      school_code: { type: Sequelize.STRING, unique: true },
      abbreviation: Sequelize.STRING,
      email: Sequelize.STRING,
      phone: Sequelize.STRING,
      contact_number: Sequelize.STRING,
      address: Sequelize.STRING,
      city: Sequelize.STRING,
      state: Sequelize.STRING,
      pincode: Sequelize.STRING,
      logo_path: Sequelize.STRING,
      logo_url: Sequelize.STRING,
      website: Sequelize.STRING,
      principal_name: Sequelize.STRING,
      principal_email: Sequelize.STRING,
      year_established: Sequelize.INTEGER,
      board: Sequelize.STRING,
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
    await q.dropTable("schools");
  },
};
