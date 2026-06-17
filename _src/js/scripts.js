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

// Upload page
const uploadForm = document.getElementById("uploadForm");
if (uploadForm) {
  let isSubmitting = false;
  let uploadFiles = [];

  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("files");
  const previewList = document.getElementById("previewList");
  const statusDiv = document.getElementById("uploadStatus");

  fileInput.addEventListener("change", (e) => {
    addFiles(Array.from(e.target.files));
    fileInput.value = "";
  });

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
  dropZone.addEventListener("dragleave", (e) => {
    if (!dropZone.contains(e.relatedTarget)) {
      dropZone.classList.remove("dragover");
    }
  });
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    addFiles(files);
  });

  function addFiles(files) {
    files.forEach((file) => {
      uploadFiles.push(file);
      renderPreview(file, uploadFiles.length - 1);
    });
  }

  function renderPreview(file, index) {
    const item = document.createElement("div");
    item.className = "preview-item";
    item.draggable = true;
    item.dataset.index = index;

    const media = file.type.startsWith("video/")
      ? document.createElement("video")
      : document.createElement("img");
    media.src = URL.createObjectURL(file);
    if (media.tagName === "VIDEO") {
      media.muted = true;
      media.preload = "metadata";
    }
    item.appendChild(media);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "preview-remove";
    removeBtn.setAttribute("aria-label", "Remove");
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => {
      uploadFiles.splice(uploadFiles.indexOf(file), 1);
      rebuildPreviews();
    });
    item.appendChild(removeBtn);

    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", String(index));
      item.classList.add("dragging");
    });
    item.addEventListener("dragend", () => item.classList.remove("dragging"));
    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      item.classList.add("drag-over");
    });
    item.addEventListener("dragleave", () => item.classList.remove("drag-over"));
    item.addEventListener("drop", (e) => {
      e.preventDefault();
      item.classList.remove("drag-over");
      const from = parseInt(e.dataTransfer.getData("text/plain"));
      const to = parseInt(item.dataset.index);
      if (from !== to) {
        const moved = uploadFiles.splice(from, 1)[0];
        uploadFiles.splice(to, 0, moved);
        rebuildPreviews();
      }
    });

    previewList.appendChild(item);
  }

  function rebuildPreviews() {
    previewList.innerHTML = "";
    uploadFiles.forEach((file, i) => renderPreview(file, i));
  }

  async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "insta-idol");
    formData.append("folder", "insta-idol");
    formData.append("image_metadata", "true");
    const basename = file.name.replace(/\.[^/.]+$/, "");
    formData.append("public_id", `${basename}_${Date.now()}`);
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/insta-idol/image/upload",
      { method: "POST", body: formData }
    );
    const data = await response.json();
    if (!data.secure_url) throw new Error("Cloudinary upload failed.");

    let exifTimestamp = null;
    const exifDate = data.image_metadata?.DateTimeOriginal;
    if (exifDate) {
      const iso = exifDate.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
      const ts = Math.floor(new Date(iso).getTime() / 1000);
      if (!isNaN(ts)) exifTimestamp = ts;
    }

    return { url: data.secure_url, exifTimestamp };
  }

  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (uploadFiles.length === 0) {
      statusDiv.textContent = "Please select at least one file.";
      statusDiv.className = "upload-status upload-status--error";
      return;
    }

    isSubmitting = true;
    const submitBtn = uploadForm.querySelector("[type=submit]");
    submitBtn.disabled = true;
    statusDiv.className = "upload-status";

    const title = document.getElementById("title")?.value.trim() || "";
    const alt = document.getElementById("alt")?.value.trim() || "";
    const dateInput = document.getElementById("date");

    try {
      const uploads = [];
      for (let i = 0; i < uploadFiles.length; i++) {
        statusDiv.textContent = `Uploading file ${i + 1} of ${uploadFiles.length}…`;
        uploads.push(await uploadToCloudinary(uploadFiles[i]));
      }

      const urls = uploads.map(u => u.url);
      const exifTimestamp = uploads[0]?.exifTimestamp ?? null;
      const creation_timestamp = dateInput?.value
        ? Math.floor(new Date(`${dateInput.value}T00:00:00-06:00`).getTime() / 1000)
        : exifTimestamp ?? Math.floor(Date.now() / 1000);

      statusDiv.textContent = "Saving post…";
      const response = await fetch("/.netlify/functions/upload-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, alt, files: urls, creation_timestamp }),
      });
      const result = await response.json();

      if (response.ok) {
        statusDiv.textContent = "Posted!";
        statusDiv.className = "upload-status upload-status--success";
        uploadForm.reset();
        uploadFiles = [];
        previewList.innerHTML = "";
      } else {
        throw new Error(result.message || "Server error");
      }
    } catch (err) {
      statusDiv.textContent = "Upload failed. Please try again.";
      statusDiv.className = "upload-status upload-status--error";
      console.error(err);
    }

    isSubmitting = false;
    submitBtn.disabled = false;
  });
}

