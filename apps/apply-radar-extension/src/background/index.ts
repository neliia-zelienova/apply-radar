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

// Message types
type ScheduleInterviewAlarmMessage = {
  type: "scheduleInterviewAlarm";
  interviewId: string;
  dateISO: string;
  notifyMinutesBefore: number;
  title: string;
  link?: string;
};

type CancelInterviewAlarmMessage = {
  type: "cancelInterviewAlarm";
  interviewId: string;
};

// Listen to schedule/cancel messages
chrome.runtime.onMessage.addListener(
  (
    msg: ScheduleInterviewAlarmMessage | CancelInterviewAlarmMessage,
    _sender,
    sendResponse,
  ) => {
    if (msg.type === "scheduleInterviewAlarm") {
      const when =
        new Date(msg.dateISO).getTime() - msg.notifyMinutesBefore * 60000;
      const now = Date.now();
      const delayMs = Math.max(0, when - now);
      const alarmName = `interview-${msg.interviewId}`;
      // MV3 alarms only support when or delayInMinutes; convert to minutes when needed
      const delayInMinutes = Math.ceil(delayMs / 60000);
      // Persist metadata for notification: title and optional link
      const meta = { title: msg.title, link: msg.link ?? null } as const;
      chrome.storage.local.set({ [alarmName]: meta }, () => {
        chrome.alarms.create(alarmName, { delayInMinutes });
        sendResponse({ ok: true });
      });
      return true;
    }
    if (msg.type === "cancelInterviewAlarm") {
      const alarmName = `interview-${msg.interviewId}`;
      chrome.alarms.clear(alarmName, (cleared) => {
        // Clean up persisted metadata
        chrome.storage.local.remove(alarmName, () => {
          sendResponse({ ok: cleared });
        });
      });
      return true;
    }
  },
);

// Show notification when alarm fires
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith("interview-")) {
    const interviewId = alarm.name.replace("interview-", "");
    // Retrieve persisted metadata for the notification
    chrome.storage.local.get(alarm.name, (result) => {
      const meta = result?.[alarm.name] as
        | { title?: string; link?: string | null }
        | undefined;
      const title = meta?.title || "Interview reminder";
      const message = meta?.link
        ? "Click to open interview link"
        : "You have an upcoming interview";

      chrome.notifications.create(alarm.name, {
        type: "basic",
        iconUrl: "logo.svg",
        title,
        message,
        priority: 2,
      });

      console.log("Notification for interview", interviewId, meta);
    });
  }
});

// Handle notification clicks to open the stored link if present
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId.startsWith("interview-")) {
    chrome.storage.local.get(notificationId, (result) => {
      const meta = result?.[notificationId] as
        | { link?: string | null }
        | undefined;
      const link = meta?.link;
      if (link) {
        // Open the link in a new tab
        chrome.tabs.create({ url: link });
      }
    });
  }
});
