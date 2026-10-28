"use strict";

const fs = require("node:fs");
const path = require("node:path");

const rawName = process.argv[2] || "new-seeder";
const slug = rawName
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

if (!slug) {
  console.error("Provide a seeder name containing letters or numbers.");
  process.exit(2);
}

const functionSuffix = slug
  .split("-")
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join("");
const functionName = `seed${functionSuffix}`;
const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
const filename = `${timestamp}-${slug}.seeder.js`;
const seedersDirectory = path.resolve(__dirname, "../src/db/mongo/seeders");
const filePath = path.join(seedersDirectory, filename);
const template = `"use strict";

const ${functionName} = async (db) => {
  // TODO: Add idempotent seed operations using the supplied models.
  throw new Error("Implement this seeder before registering it");
};

module.exports = { ${functionName} };
`;

try {
  fs.writeFileSync(filePath, template, { flag: "wx" });
  console.log(`Generated seeder: ${path.relative(process.cwd(), filePath)}`);
} catch (error) {
  if (error.code === "EEXIST") {
    console.error(`Seeder already exists: ${filename}`);
    process.exit(1);
  }
  throw error;
}
