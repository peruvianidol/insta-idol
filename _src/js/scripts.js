document.addEventListener("DOMContentLoaded", () => {
  // Load saved view preference
  const savedView = localStorage.getItem("viewPreference");
  if (savedView) {
    const radioButton = document.getElementById(savedView);
    if (radioButton) {
      radioButton.checked = true;
    }
  }

  // Add event listeners to save the preference
  document.querySelectorAll('input[name="view"]').forEach((radio) => {
    radio.addEventListener("change", (event) => {
      localStorage.setItem("viewPreference", event.target.id);
    });
  });
});

// Function to stop all videos inside a dialog when it closes
function stopVideosInDialog(dialog) {
  const videos = dialog.querySelectorAll("video");
  videos.forEach((video) => {
    video.pause();
    video.currentTime = 0; // Reset to the beginning
  });
}

// Add event listeners for the 'close' event on all dialogs
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("close", () => {
    stopVideosInDialog(dialog);
  });
});

// Close dialog when clicking on the backdrop
document.addEventListener("click", (event) => {
  const openDialogs = Array.from(document.querySelectorAll("dialog[open]"));
  for (const dialog of openDialogs) {
    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!isInDialog) {
      dialog.close();
    }
  }
});

document.querySelectorAll(".dialog-button").forEach((button) => {
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById(button.dataset.dialogId).showModal();
  });
});

// Function to upload an image directly to Cloudinary and return the URL
let isUploading = false; // Prevent duplicate uploads

async function uploadImageToCloudinary(file) {
  if (isUploading) {
    console.warn("⚠️ Upload already in progress, skipping duplicate upload.");
    return null;
  }

  isUploading = true; // Mark upload as in progress

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "insta-idol"); 

  try {
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/insta-idol/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    if (!data.secure_url) {
      throw new Error("Failed to upload image to Cloudinary.");
    }

    console.log("✅ Image uploaded to Cloudinary:", data.secure_url);
    isUploading = false; // Reset for next upload
    return data.secure_url;
  } catch (error) {
    isUploading = false;
    console.error("❌ Cloudinary upload error:", error);
    throw error;
  }
}

// Modify the upload form to first upload to Cloudinary, then send the URL to Netlify
let isSubmitting = false; // Prevent double submission

document.getElementById("uploadForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  if (isSubmitting) {
    console.warn("⚠️ Upload already in progress, skipping duplicate Netlify request.");
    return;
  }

  isSubmitting = true; // Mark form as submitting

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
    // ✅ Step 1: Upload the image to Cloudinary FIRST
    const imageUrl = await uploadImageToCloudinary(file);

    if (!imageUrl) {
      throw new Error("Cloudinary upload failed.");
    }

    document.getElementById("uploadStatus").innerText = "Uploading post data...";

    // ✅ Step 2: Send the Cloudinary URL to Netlify function
    const response = await fetch("/.netlify/functions/upload-media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title,
        file: imageUrl, // Send URL instead of Base64
      }),
    });

    const result = await response.json();
    document.getElementById("uploadStatus").innerText =
      result.message || "✅ Upload complete!";
  } catch (error) {
    document.getElementById("uploadStatus").innerText = "❌ Upload failed.";
    console.error("❌ Error:", error);
  }

  isSubmitting = false; // Reset flag for next upload
});
