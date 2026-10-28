"use strict";

const fs = require("node:fs");
const path = require("node:path");

const rawName = process.argv[2] || "new-migration";
const slug = rawName
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

if (!slug) {
  console.error("Provide a migration name containing letters or numbers.");
  process.exit(2);
}

const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
const filename = `${timestamp}-${slug}.js`;
const migrationsDirectory = path.resolve(__dirname, "../src/db/mongo/migrations");
const filePath = path.join(migrationsDirectory, filename);
const template = `"use strict";

const tableNames = require("../../tableNames");

const up = async (db) => {
  // TODO: Apply the forward schema/data change.
  throw new Error("Implement up() before running this migration");
};

const down = async (db) => {
  // TODO: Safely reverse the change made by up().
  throw new Error("Implement down() before rolling back this migration");
};

module.exports = { up, down };
`;

try {
  fs.writeFileSync(filePath, template, { flag: "wx" });
  console.log(`Generated migration: ${path.relative(process.cwd(), filePath)}`);
} catch (error) {
  if (error.code === "EEXIST") {
    console.error(`Migration already exists: ${filename}`);
    process.exit(1);
  }
  throw error;
}
