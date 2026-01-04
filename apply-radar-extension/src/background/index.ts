export default chrome.runtime.onInstalled.addListener(() => {
  console.log("Background Service Worker working...");
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "open_side_panel") {
    chrome.windows.getCurrent((w) => {
      chrome.sidePanel.open({ windowId: w.id! });
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
    sendResponse
  ) => {
    if (msg.type === "scheduleInterviewAlarm") {
      const when =
        new Date(msg.dateISO).getTime() - msg.notifyMinutesBefore * 60000;
      const now = Date.now();
      const delayMs = Math.max(0, when - now);
      const alarmName = `interview-${msg.interviewId}`;
      // MV3 alarms only support when or delayInMinutes; convert to minutes when needed
      const delayInMinutes = Math.ceil(delayMs / 60000);
      chrome.alarms.create(alarmName, { delayInMinutes });
      sendResponse({ ok: true });
      return true;
    }
    if (msg.type === "cancelInterviewAlarm") {
      const alarmName = `interview-${msg.interviewId}`;
      chrome.alarms.clear(alarmName, (cleared) => {
        sendResponse({ ok: cleared });
      });
      return true;
    }
  }
);

// Show notification when alarm fires
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith("interview-")) {
    const interviewId = alarm.name.replace("interview-", "");
    chrome.notifications.create(alarm.name, {
      type: "basic",
      iconUrl: "logo.svg",
      title: "Interview reminder",
      message: "You have an upcoming interview",
      priority: 2,
    });
    // Optional: store last notified ID or additional metadata
    console.log("Notification for interview", interviewId);
  }
});
