---
title: New Post
layout: base.njk
hideViewToggle: true
---

<form id="uploadForm" class="upload-form flow">
  <div id="dropZone" class="drop-zone">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 16V7.85l-2.6 2.6L7 9l5-5 5 5-1.4 1.45L13 7.85V16h-2Zm-5 4q-.825 0-1.413-.588T4 18v-3h2v3h12v-3h2v3q0 .825-.588 1.413T18 20H6Z"/></svg>
    <p>Drop photos or videos here, or <label for="files" class="upload-browse">browse</label></p>
    <input type="file" id="files" name="files" multiple accept="image/*,video/*" class="sr-only">
  </div>

  <div id="previewList" class="preview-list"></div>

  <div class="flow">
    <div>
      <label for="title">Caption</label>
      <textarea id="title" name="title" rows="3" placeholder="Write a caption…"></textarea>
    </div>
    <div>
      <label for="date">Date taken (optional)</label>
      <input type="date" id="date" name="date">
    </div>
    <button type="submit">Post</button>
  </div>
</form>

<div id="uploadStatus" class="upload-status" aria-live="polite"></div>
