import { PENDING_IMPORT_KEY, readTabForImport } from "../services/page-import";

const ADD_FROM_PAGE_MENU_ID = "apply-radar-add-from-page";

chrome.runtime.onInstalled.addListener(() => {
  console.log("Background Service Worker working...");
  // Right-click on any page: "Add this job to Apply Radar". (Re)created on
  // install/update; removeAll first, since creating an existing id fails.
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: ADD_FROM_PAGE_MENU_ID,
      title: "Add this job to Apply Radar",
      contexts: ["page"],
    });
  });
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

// Context menu: open the side panel (only allowed right in the click handler),
// read the page (the click grants activeTab for it) and hand it to the panel,
// which opens the pre-filled "Add application" form.
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== ADD_FROM_PAGE_MENU_ID || !tab) return;
  if (typeof tab.windowId === "number") {
    chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {
      // Panel can't open (e.g. another one is focused); the import still waits for it.
    });
  }
  void readTabForImport(tab).then((pending) =>
    chrome.storage.session.set({ [PENDING_IMPORT_KEY]: pending }),
  );
});
