const apiUrlInput = document.getElementById("apiUrl");
const noteInput = document.getElementById("note");
const saveBtn = document.getElementById("saveBtn");
const statusEl = document.getElementById("status");

async function loadSettings() {
  const stored = await chrome.storage.sync.get(["apiUrl"]);
  if (stored.apiUrl) {
    apiUrlInput.value = stored.apiUrl;
  }
}

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`.trim();
}

saveBtn.addEventListener("click", async () => {
  setStatus("");
  saveBtn.disabled = true;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const apiUrl = apiUrlInput.value.replace(/\/$/, "");

    if (!tab?.url) {
      throw new Error("Could not read the current tab URL.");
    }

    await chrome.storage.sync.set({ apiUrl });

    const response = await fetch(`${apiUrl}/api/bookmarks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: tab.url,
        title: tab.title,
        note: noteInput.value.trim() || undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "Failed to save bookmark.");
    }

    setStatus("Saved to MindMark.", "success");
    noteInput.value = "";
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Save failed.", "error");
  } finally {
    saveBtn.disabled = false;
  }
});

loadSettings();
