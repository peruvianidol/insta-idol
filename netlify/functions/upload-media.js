require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { exec } = require("child_process");

const GIT_COMMIT_MESSAGE = "Auto-update posts.json with new upload";

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
    console.log("🚀 upload-media function started!");

    const body = JSON.parse(event.body);

    if (!body.title || !body.file) {
      console.error("❌ Missing title or file in request");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing title or file data" }),
      };
    }

    console.log(`📸 Uploading file for title: ${body.title}`);

    let fileData = body.file;

    // Check if input is a URL or Base64
    const isURL = fileData.startsWith("http");
    const isBase64 = /^[A-Za-z0-9+/=]+$/.test(fileData) && !isURL;

    if (isBase64) {
      fileData = `data:image/jpeg;base64,${fileData}`; // Ensure proper Base64 format
    }

    console.log("📸 Uploading file to Cloudinary:", fileData.substring(0, 100)); // Log first 100 characters

    const uploadResult = await cloudinary.uploader.upload(fileData, {
      folder: "insta-idol/",
      resource_type: "auto",
    });

    console.log("✅ Cloudinary upload complete:", uploadResult.secure_url);

    const creation_timestamp = Math.floor(Date.now() / 1000);
    const latitude = null; // Placeholder for EXIF data
    const longitude = null;

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
    try {
      await new Promise((resolve, reject) => {
        exec(
          `git add ${POSTS_FILE_PATH} && git commit -m "${GIT_COMMIT_MESSAGE}" && git push origin main`,
          (err, stdout, stderr) => {
            if (err) {
              console.error("❌ Git commit/push failed:", stderr);
              reject(err);
            } else {
              console.log("✅ Git commit and push successful!");
              resolve(stdout);
            }
          }
        );
      });
    } catch (error) {
      console.error("❌ Git commit/push process failed:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to commit and push posts.json" }),
      };
    }

    console.log("🎉 upload-media function completed!");

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Upload successful, posts.json updated, and committed to GitHub!",
        url: uploadResult.secure_url,
      }),
    };
  } catch (error) {
    console.error("🔥 Full error details:", error);

    let errorMessage;
    if (error.response) {
      errorMessage = await error.response.text(); // Get Cloudinary or API failure reason
    } else {
      errorMessage = error.message || "Unknown server error";
    }
    
    console.error("📜 Error Message from API:", errorMessage);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" }, // Ensure JSON response
      body: JSON.stringify({ error: errorMessage }),
    };    
  }
};
