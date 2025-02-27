document.addEventListener('DOMContentLoaded', () => {
  // Load the saved view preference
  const savedView = localStorage.getItem('viewPreference');
  if (savedView) {
    const radioButton = document.getElementById(savedView);
    if (radioButton) {
      radioButton.checked = true;
    }
  }

  // Add event listeners to save the preference
  document.querySelectorAll('input[name="view"]').forEach((radio) => {
    radio.addEventListener('change', (event) => {
      localStorage.setItem('viewPreference', event.target.id);
    });
  });
});

// Close dialog when clicking on backdrop
document.addEventListener('click', (event) => {
  const openDialogs = Array.from(document.querySelectorAll('dialog[open]'));
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

// Function to stop all videos inside a dialog
function stopVideosInDialog(dialog) {
  const videos = dialog.querySelectorAll('video');
  videos.forEach((video) => {
    video.pause();
    video.currentTime = 0; // Reset to the beginning
  });
}

// Add event listeners for the 'close' event on all dialogs
document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.addEventListener('close', () => {
    stopVideosInDialog(dialog);
  });
});

document.querySelectorAll('.dialog-button').forEach((button) => {
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById(button.dataset.dialogId).showModal();
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const dialog = document.querySelector("dialog");

  if (!dialog) {
    console.warn("⚠️ No dialog found on the page.");
    return;
  }

  const scrollContainer = dialog.querySelector("dialog > div");

  if (!scrollContainer) {
    console.warn("⚠️ No scroll container found inside dialog.");
    return;
  }

  const firstImage = scrollContainer.querySelector("img");

  if (!firstImage) {
    console.warn("⚠️ No image found inside scroll container.");
    return;
  }

  const adjustScrollContainerWidth = () => {
    const viewportWidth = window.innerWidth; // Viewport width
    const viewportHeight = window.innerHeight; // Viewport height

    // Calculate dialog's max dimensions
    const dialogComputedStyle = getComputedStyle(dialog);
    const dialogPadding = parseFloat(dialogComputedStyle.padding) || 0;
    const dialogMaxWidth = viewportWidth - 2 * dialogPadding - 6; // 2em - 6px adjustment
    const dialogMaxHeight = viewportHeight - 2 * dialogPadding - 6; // 2em - 6px adjustment

    // Ensure firstImage has dimensions before calculations
    if (!firstImage.naturalWidth || !firstImage.naturalHeight) {
      console.warn("⚠️ Image dimensions are not available yet.");
      return;
    }

    // Calculate the rendered width of the first image
    const aspectRatio = firstImage.naturalWidth / firstImage.naturalHeight;
    const renderedImageWidth = Math.min(
      firstImage.naturalWidth,
      dialogMaxHeight * aspectRatio,
      dialogMaxWidth
    );

    // Account for subtle rounding or scrollbar discrepancies
    const scrollbarWidth = scrollContainer.offsetWidth - scrollContainer.clientWidth;
    const containerWidth = renderedImageWidth - scrollbarWidth;

    // Apply the calculated width to the scroll container
    scrollContainer.style.width = `${containerWidth}px`;
  };

  // Adjust width when the image is loaded
  firstImage.onload = adjustScrollContainerWidth;

  // Handle cached images
  if (firstImage.complete) {
    adjustScrollContainerWidth();
  }

  // Adjust width on window resize
  window.addEventListener("resize", adjustScrollContainerWidth);
});
