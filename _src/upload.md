---
title: New Post
layout: base.njk
---

## New Post

<form id="uploadForm">
  <label for="title">Caption:</label>
  <input type="text" id="title" name="title" required>
  
  <label for="files">Upload Images/Videos:</label>
  <input type="file" id="files" name="files" multiple accept="image/*,video/*" required>
  
  <button type="submit">Upload</button>
</form>

<div id="uploadStatus"></div>

<script>
document.getElementById("uploadForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const fileInput = document.getElementById("files");
  const file = fileInput.files[0];

  if (!title || !file) {
    alert("Please provide a title and select a file.");
    return;
  }

  // Convert file to base64
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = async function () {
    const base64File = reader.result.split(",")[1]; // Extract base64 data

    const payload = JSON.stringify({
      title: title,
      file: base64File,
    });

    document.getElementById("uploadStatus").innerText = "Uploading...";

    try {
      const response = await fetch("/.netlify/functions/upload-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });

      const result = await response.json();
      document.getElementById("uploadStatus").innerText = result.message || "Upload complete!";
    } catch (error) {
      document.getElementById("uploadStatus").innerText = "Upload failed.";
      console.error("Error:", error);
    }
  };

  reader.onerror = function (error) {
    console.error("Error converting file:", error);
  };
});
</script>

