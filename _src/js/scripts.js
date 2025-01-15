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