chrome.runtime.onInstalled.addListener(() => {
  console.log("Background Service Worker working...");
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
