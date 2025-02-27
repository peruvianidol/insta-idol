const fs = require("fs");
require("dotenv").config();

// Ensure _site/ directory exists
const siteDir = "_site";
if (!fs.existsSync(siteDir)) {
  fs.mkdirSync(siteDir, { recursive: true });
}

const username = process.env.BASIC_AUTH_USERNAME;
const password = process.env.BASIC_AUTH_PASSWORD;

if (!username || !password) {
  console.error("❌ Missing authentication credentials.");
  process.exit(1);
}

// Read _headers template, replace placeholders with environment variables
let headersContent = fs.readFileSync("_headers", "utf8");
headersContent = headersContent
  .replace("${BASIC_AUTH_USERNAME}", username)
  .replace("${BASIC_AUTH_PASSWORD}", password);

// Write updated headers file to _site/
fs.writeFileSync(`${siteDir}/_headers`, headersContent);
console.log("✅ _headers file generated successfully!");
