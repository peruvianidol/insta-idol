const fs = require("fs");
require("dotenv").config();

const username = process.env.BASIC_AUTH_USERNAME;
const password = process.env.BASIC_AUTH_PASSWORD;

if (!username || !password) {
  console.error("❌ Error: Missing Basic Auth credentials in environment variables.");
  process.exit(1);
}

const headersTemplate = fs.readFileSync("_headers.template", "utf8");
const headersContent = headersTemplate
  .replace("${BASIC_AUTH_USERNAME}", username)
  .replace("${BASIC_AUTH_PASSWORD}", password);

fs.writeFileSync("_headers", headersContent);
console.log("✅ _headers file generated successfully!");
