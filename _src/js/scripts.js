document.addEventListener("DOMContentLoaded", () => {
  const savedView = localStorage.getItem("viewPreference");
  if (savedView) {
    const radioButton = document.getElementById(savedView);
    if (radioButton) {
      radioButton.checked = true;
    }
  }

  document.querySelectorAll('input[name="view"]').forEach((radio) => {
    radio.addEventListener("change", (event) => {
      localStorage.setItem("viewPreference", event.target.id);
    });
  });
});

// Prevent duplicate uploads
let isUploading = false;
let isSubmitting = false;

// Uploads image to Cloudinary and returns the URL
async function uploadImageToCloudinary(file) {
  if (isUploading) {
    console.warn("⚠️ Upload already in progress, skipping duplicate upload.");
    return null;
  }

  isUploading = true;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "insta-idol");
  formData.append("folder", "insta-idol");

  // ✅ Force Cloudinary to generate a unique filename
  formData.append("public_id", ""); // Empty public_id tells Cloudinary to ignore original filename

  // ✅ Add metadata
  const creationTimestamp = Math.floor(Date.now() / 1000);
  formData.append("context", `caption=${title}|creation_timestamp=${creationTimestamp}`);


  try {
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/insta-idol/image/upload",
      { method: "POST", body: formData }
    );

    const data = await response.json();
    if (!data.secure_url) {
      throw new Error("Cloudinary upload failed.");
    }

    console.log("✅ Image uploaded to Cloudinary:", data.secure_url);
    isUploading = false;
    return data.secure_url;
  } catch (error) {
    isUploading = false;
    console.error("❌ Cloudinary upload error:", error);
    throw error;
  }
}

// Handles form submission
document.getElementById("uploadForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  if (isSubmitting) {
    console.warn("⚠️ Upload already in progress.");
    return;
  }

  isSubmitting = true;

  const title = document.getElementById("title").value;
  const fileInput = document.getElementById("files");
  const file = fileInput.files[0];

  if (!title || !file) {
    alert("❌ Please provide a title and select a file.");
    isSubmitting = false;
    return;
  }

  document.getElementById("uploadStatus").innerText = "Uploading image...";
  
  try {
    const imageUrl = await uploadImageToCloudinary(file);

    if (!imageUrl) {
      throw new Error("Cloudinary upload failed.");
    }

    document.getElementById("uploadStatus").innerText = "Updating site...";

    const response = await fetch("/.netlify/functions/upload-media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, file: imageUrl }),
    });

    const result = await response.json();
    document.getElementById("uploadStatus").innerText = result.message || "✅ Upload complete!";
  } catch (error) {
    document.getElementById("uploadStatus").innerText = "❌ Upload failed.";
    console.error("❌ Error:", error);
  }

  isSubmitting = false;
});
