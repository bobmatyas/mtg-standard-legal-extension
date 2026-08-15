/**
 * Loads saved site toggles into the popup checkboxes.
 */
async function restoreToggles() {
  const sites = await chrome.storage.sync.get(SITE_DEFAULTS);
  for (const key of Object.keys(SITE_DEFAULTS)) {
    const input = document.getElementById(key);
    if (input) input.checked = sites[key] !== false;
  }
}

/**
 * Saves a site toggle when the user checks or unchecks it.
 * @param {Event} event
 */
function handleToggleChange(event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  chrome.storage.sync.set({ [input.id]: input.checked });
}

document.querySelectorAll('input[type="checkbox"]').forEach((input) => {
  input.addEventListener('change', handleToggleChange);
});

restoreToggles();
