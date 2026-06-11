export enum ApplicationStatus {
  PENDING = "pending",
  INTERVIEW = "interview",
  OFFERED = "offered",
  REJECTED = "rejected",
}

export interface Interview {
  id: string;
  name?: string; // e.g., Screening, Technical, Onsite
  date: string; // ISO string
  locationLink?: string; // Zoom/Maps/office link
  notes?: string;
  notifyEnabled?: boolean; // whether to schedule a notification
  notifyMinutesBefore?: number; // minutes before interview
}
export interface ApplicationData {
  id: string;
  companyName: string;
  position: string;
  status: ApplicationStatus;
  link: string;
  notes: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
  interviews?: Interview[];
}
