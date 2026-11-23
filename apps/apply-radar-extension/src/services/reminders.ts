import type { RemindersContextType } from "@apply-radar/ui";

/** Interview reminders via the background service worker (chrome.alarms + notifications). */
export const chromeReminders: RemindersContextType = {
  scheduleInterviewReminder: (reminder) => {
    chrome.runtime.sendMessage({
      type: "scheduleInterviewAlarm",
      interviewId: reminder.interviewId,
      dateISO: reminder.scheduledAt,
      notifyMinutesBefore: reminder.notifyMinutesBefore,
      title: reminder.title,
      link: reminder.link,
    });
  },
  cancelInterviewReminder: (interviewId) => {
    chrome.runtime.sendMessage({ type: "cancelInterviewAlarm", interviewId });
  },
};
