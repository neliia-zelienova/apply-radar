export enum ApplicationStatus {
    PENDING = "pending",
    INTERVIEW = "interview",
    OFFERED = "offered",
    REJECTED = "rejected",
}

export interface ApplicationData {
    id: string;
    name: string;
    status: ApplicationStatus;
    link: string;
    notes: string;
    favorite: boolean;
    createdAt: string;
    updatedAt: string;
    archived?: boolean;
}