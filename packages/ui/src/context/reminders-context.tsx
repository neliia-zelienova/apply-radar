import { createContext, useContext } from "react";

export interface InterviewReminder {
  interviewId: string;
  /** ISO date-time of the interview. */
  scheduledAt: string;
  notifyMinutesBefore: number;
  title: string;
  link?: string;
}

/**
 * Lets an app plug in interview reminders (the extension uses chrome.alarms).
 * Without a provider, reminders are a no-op — e.g. in the web app.
 */
export interface RemindersContextType {
  scheduleInterviewReminder: (reminder: InterviewReminder) => void;
  cancelInterviewReminder: (interviewId: string) => void;
}

const noReminders: RemindersContextType = {
  scheduleInterviewReminder: () => {},
  cancelInterviewReminder: () => {},
};

export const RemindersContext = createContext<RemindersContextType>(noReminders);

export const useReminders = (): RemindersContextType => useContext(RemindersContext);
