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

  // ✅ Fix: Only get caption if "title" input exists
  const titleInput = document.getElementById("title");
  const captionText = titleInput ? titleInput.value.trim() : "Untitled"; // Default to "Untitled" if missing
  const creationTimestamp = Math.floor(Date.now() / 1000);

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
const uploadForm = document.getElementById("uploadForm");
if (uploadForm) {
  uploadForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (isSubmitting) {
      console.warn("⚠️ Upload already in progress.");
      return;
    }

    isSubmitting = true;

    const titleInput = document.getElementById("title");
    const title = titleInput ? titleInput.value.trim() : ""; // Default if missing
    const fileInput = document.getElementById("files");
    const files = fileInput ? Array.from(fileInput.files) : [];

    if (files.length === 0) {
      alert("❌ Please select at least one file.");
      isSubmitting = false;
      return;
    }

    document.getElementById("uploadStatus").innerText = "Uploading image...";
    
    try {
      const uploadedImages = [];

      for (const file of files) {
        const imageUrl = await uploadImageToCloudinary(file);
        if (imageUrl) {
          uploadedImages.push(imageUrl);
        } else {
          console.warn(`⚠️ Upload failed for ${file.name}`);
        }
      }

      if (uploadedImages.length === 0) {
        throw new Error("Cloudinary upload failed for all files.");
      }

      document.getElementById("uploadStatus").innerText = "Updating site...";

      const response = await fetch("/.netlify/functions/upload-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, files: uploadedImages }),
      });

      const result = await response.json();
      document.getElementById("uploadStatus").innerText = result.message || "✅ Upload complete!";
    } catch (error) {
      document.getElementById("uploadStatus").innerText = "❌ Upload failed.";
      console.error("❌ Error:", error);
    }

    isSubmitting = false;
  });
}

// ✅ Fix: Only Attach Event Listeners If Dialog Buttons Exist
const dialogButtons = document.querySelectorAll(".dialog-button");
if (dialogButtons.length > 0) {
  dialogButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const dialog = document.getElementById(button.dataset.dialogId);
      if (dialog) {
        dialog.showModal();
      }
    });
  });
}

document.addEventListener("click", (event) => {
  const openDialogs = document.querySelectorAll("dialog[open]");

  for (const dialog of openDialogs) {
    const figure = dialog.querySelector("figure");

    const rect = figure.getBoundingClientRect();
    const isInFigure =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!isInFigure) {
      dialog.close();
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("dialog").forEach((dialog) => {
    const container = dialog.querySelector(".image-container");
    const prevButton = dialog.querySelector(".prev");
    const nextButton = dialog.querySelector(".next");

    if (!container || !prevButton || !nextButton) {
      console.error("❌ Missing elements inside dialog!");
      return;
    }

    prevButton.addEventListener("click", () => {
      container.scrollBy({ left: -container.clientWidth, behavior: "smooth" });
    });

    nextButton.addEventListener("click", () => {
      container.scrollBy({ left: container.clientWidth, behavior: "smooth" });
    });
  });
});

document.addEventListener("close", (event) => {
  if (event.target.tagName === "DIALOG") {
    // Stop and reset videos
    const videos = event.target.querySelectorAll("video");
    videos.forEach(video => {
      video.pause();
      video.currentTime = 0;
    });
        
  }
}, true);
