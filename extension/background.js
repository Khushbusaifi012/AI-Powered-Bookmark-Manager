chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ apiUrl: "http://localhost:3000" });
});
