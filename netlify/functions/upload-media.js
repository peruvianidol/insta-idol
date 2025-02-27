require("dotenv").config();
const axios = require("axios");

async function updateGitHubFile(newPost) {
  const repoOwner = "peruvianidol";
  const repoName = "insta-idol";
  const filePath = "_src/_data/posts.json";
  const branch = "main";

  const githubToken = process.env.GITHUB_TOKEN;

  const fileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
  const headers = { Authorization: `token ${githubToken}`, Accept: "application/vnd.github.v3+json" };

  try {
    const { data } = await axios.get(fileUrl, { headers });

    const existingContent = JSON.parse(Buffer.from(data.content, "base64").toString("utf-8"));
    existingContent.unshift(newPost);
    
    const updatedContent = Buffer.from(JSON.stringify(existingContent, null, 2)).toString("base64");

    await axios.put(fileUrl, {
      message: "Auto-update posts.json with new upload",
      content: updatedContent,
      sha: data.sha,
      branch: branch,
    }, { headers });

    console.log("✅ posts.json successfully updated in GitHub!");
    return true;
  } catch (error) {
    console.error("❌ Failed to update posts.json in GitHub:", error);
    return false;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    console.log("🚀 upload-media function started!");

    const body = JSON.parse(event.body);
    if (!body.title || !body.files || !Array.isArray(body.files) || body.files.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing title or files data" }) };
    }
    
    const newPost = {
      creation_timestamp: Math.floor(Date.now() / 1000),
      title: body.title,
      media: body.files, // Store all uploaded images
    };
    
    const success = await updateGitHubFile(newPost);
    if (!success) {
      return { statusCode: 500, body: JSON.stringify({ error: "Failed to update posts.json in GitHub" }) };
    }

    return { statusCode: 200, body: JSON.stringify({ message: "Upload successful, GitHub updated!", url: body.file }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
