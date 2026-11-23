chrome.runtime.onInstalled.addListener(() => {
  console.log("Background Service Worker working...");
  // Interview reminders were removed: drop their leftover metadata.
  chrome.storage.local.get(null, (items) => {
    const stale = Object.keys(items ?? {}).filter((key) => key.startsWith("interview-"));
    if (stale.length > 0) chrome.storage.local.remove(stale);
  });
});

chrome.commands.onCommand.addListener((command: string) => {
  if (command === "open_side_panel") {
    chrome.windows.getCurrent((w: chrome.windows.Window) => {
      const windowId = w?.id;
      if (typeof windowId === "number") {
        chrome.sidePanel.open({ windowId });
      }
      console.log("Command/Ctrl + O triggered! :)");
    });
  }
});
