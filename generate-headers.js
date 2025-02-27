const fs = require("fs");

const username = process.env.BASIC_AUTH_USERNAME;
const password = process.env.BASIC_AUTH_PASSWORD;

if (!username || !password) {
  console.error("❌ Missing authentication credentials.");
  process.exit(1);
}

let headersContent = fs.readFileSync("_headers", "utf8");
headersContent = headersContent
  .replace("${BASIC_AUTH_USERNAME}", username)
  .replace("${BASIC_AUTH_PASSWORD}", password);

fs.writeFileSync("_site/_headers", headersContent);
console.log("✅ _headers file generated successfully with secure credentials!");
