"use strict";
const { School, User } = require("../models");

module.exports = {
  async up () {
    // Create/Update School
    const schools = await School.bulkCreate(
      [
        {
          id: 1001,
          school_name: "Hubi -InfoTech",
          school_code: "HIT",
          email: "info@hubiinfotech.com",
          address: "Dialgam, Anantnag",
          contact_number: "7006703035",
        },
      ],
      {
        updateOnDuplicate: ["email", "address", "contact_number"]
      }
    );


    // Create/Update Admin User
    await User.bulkCreate(
      [
        {
          username: "admin",
          email: "admin@hubiinfotech.com",
          password: "$2a$10$l3hBRoWpVGxq4oXdBRDJNOCTqi7DI3yFxMt2lWXOqbtAe0f91Eomy",
          pin: "$2a$10$dTurE/.LEYF5i/axX8l6KuSOge.JtrUaKGf3c9vNokcxgNIYuURNS",
          role: "ADMIN",
          school_id: 1001,
        },
      ],
      {
        updateOnDuplicate: ["email", "password", "pin", "school_id"]
      }
    );
  },

  async down (q) {
    await q.bulkDelete("Users", null);
    await q.bulkDelete("Schools", null);
  }
};
