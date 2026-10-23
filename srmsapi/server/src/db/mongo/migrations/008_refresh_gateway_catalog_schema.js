"use strict";

const { seedGatewayCatalog } = require("../seeders/gateway.seeder");
const up = async (db) => { await seedGatewayCatalog(db); };
module.exports = { up };
