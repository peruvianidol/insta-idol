// One-off script to backfill creation_timestamp from EXIF for posts uploaded
// with the wrong date (upload time instead of photo-taken time).
// Run with: node fix-exif-timestamps.js
// Reads CLOUDINARY_* credentials from .env and writes _src/_data/posts.json in place.

require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Dec 25, 2025 00:00:00 UTC — first affected upload date
const CUTOFF = Math.floor(new Date("2025-12-25").getTime() / 1000);

function getPublicId(url) {
  // Strip optional version segment (v1234567890/) that Cloudinary prepends
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
  return match ? match[1] : null;
}

function parseExifDate(str) {
  if (!str) return null;
  // EXIF format: "YYYY:MM:DD HH:MM:SS" → ISO: "YYYY-MM-DDTHH:MM:SS"
  const iso = str.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
  const ts = Math.floor(new Date(iso).getTime() / 1000);
  return isNaN(ts) ? null : ts;
}

async function main() {
  const postsPath = path.join(__dirname, "_src/_data/posts.json");
  const posts = JSON.parse(fs.readFileSync(postsPath, "utf-8"));

  const toCheck = posts.filter(p => p.creation_timestamp >= CUTOFF);
  console.log(`Checking ${toCheck.length} posts since 2025-12-25…\n`);

  let updated = 0;

  for (const post of toCheck) {
    const url = post.media[0];
    if (!url || url.endsWith(".mp4")) {
      console.log(`skip (video/missing)  ${url}`);
      continue;
    }

    const publicId = getPublicId(url);
    if (!publicId) {
      console.log(`skip (no public_id)  ${url}`);
      continue;
    }

    try {
      const result = await cloudinary.api.resource(publicId, { image_metadata: true });
      const meta = result.image_metadata || {};
      const exifTimestamp = parseExifDate(meta.DateTimeOriginal || meta.DateTime);

      if (exifTimestamp) {
        const oldDate = new Date(post.creation_timestamp * 1000).toISOString().slice(0, 10);
        const newDate = new Date(exifTimestamp * 1000).toISOString().slice(0, 10);
        if (oldDate !== newDate) {
          console.log(`${oldDate} → ${newDate}  ${publicId}`);
          post.creation_timestamp = exifTimestamp;
          updated++;
        } else {
          console.log(`ok (same date)  ${publicId}`);
        }
      } else {
        console.log(`no EXIF date  ${publicId}`);
      }

      await new Promise(r => setTimeout(r, 250)); // stay within Admin API rate limits
    } catch (err) {
      console.error(`error  ${publicId}:`, err.error || err.message || err);
    }
  }

  if (updated > 0) {
    posts.sort((a, b) => b.creation_timestamp - a.creation_timestamp);
    fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
    console.log(`\nDone — updated ${updated} post(s). Commit posts.json to trigger a rebuild.`);
  } else {
    console.log("\nNo changes needed.");
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
