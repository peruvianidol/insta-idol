require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { exec } = require("child_process"); // 🚀 Allows us to run Git commands

const BUILD_HOOK_URL = process.env.NETLIFY_BUILD_HOOK;
const GIT_COMMIT_MESSAGE = "Auto-update posts.json with new upload"; // Customize if needed

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const POSTS_FILE_PATH = path.join(__dirname, "../../_src/_data/posts.json");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body);

    if (!body.title || !body.file) {
      console.error("❌ Missing title or file in request");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing title or file data" }),
      };
    }

    console.log(`📸 Uploading file for title: ${body.title}`);

    const creation_timestamp = Math.floor(Date.now() / 1000);
    const latitude = null; // Placeholder for EXIF data
    const longitude = null;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(`data:image/jpeg;base64,${body.file}`, {
      folder: "insta-idol/",
      resource_type: "auto",
      context: {
        caption: body.title,
        creation_timestamp: creation_timestamp.toString(),
        latitude: latitude ? latitude.toString() : "",
        longitude: longitude ? longitude.toString() : "",
      },
    });

    console.log(`✅ Upload successful: ${uploadResult.secure_url}`);

    // Create new post object
    const newPost = {
      creation_timestamp,
      title: body.title,
      latitude,
      longitude,
      media: [uploadResult.secure_url],
    };

    // Read existing posts.json
    let postsData = [];
    if (fs.existsSync(POSTS_FILE_PATH)) {
      try {
        const existingData = fs.readFileSync(POSTS_FILE_PATH, "utf-8");
        postsData = JSON.parse(existingData);
      } catch (error) {
        console.error("❌ Error reading posts.json:", error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Failed to read posts.json" }),
        };
      }
    } else {
      console.error("⚠️ posts.json not found! Not creating a new file.");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "posts.json is missing!" }),
      };
    }

    // Insert new post at the beginning
    postsData.unshift(newPost);

    // Save updated posts.json
    try {
      fs.writeFileSync(POSTS_FILE_PATH, JSON.stringify(postsData, null, 2));
      console.log("✅ Updated posts.json successfully!");
    } catch (error) {
      console.error("❌ Failed to update posts.json:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to update posts.json" }),
      };
    }

    // 🚀 **Commit & Push the Updated `posts.json` to GitHub**
    console.log("🔄 Committing and pushing posts.json to GitHub...");
    exec(
      `git add ${POSTS_FILE_PATH} && git commit -m "${GIT_COMMIT_MESSAGE}" && git push`,
      async (err, stdout, stderr) => {
        if (err) {
          console.error("❌ Git commit/push failed:", stderr);
          return;
        }
        console.log("✅ Git commit and push successful!");

        // 🚀 **Trigger Netlify Build**
        if (BUILD_HOOK_URL) {
          console.log("🔄 Triggering Netlify build...");
          try {
            await fetch(BUILD_HOOK_URL, { method: "POST" });
            console.log("✅ Netlify build triggered successfully!");
          } catch (buildError) {
            console.error("❌ Failed to trigger Netlify build:", buildError);
          }
        } else {
          console.warn("⚠️ NETLIFY_BUILD_HOOK is not set in environment variables.");
        }
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Upload successful, posts.json updated, and Netlify build triggered!",
        url: uploadResult.secure_url,
      }),
    };
  } catch (error) {
    console.error("🔥 Upload error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Server error" }),
    };
  }
};
