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

<script src="/js/scripts.js"></script>
