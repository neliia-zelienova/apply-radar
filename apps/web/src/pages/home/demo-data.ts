import { ApplicationStatus } from "@apply-radar/shared";

/** Made-up applications for the home page demo (shown as "Demo"). */
export interface DemoApplication {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  /** Where the blip sits on the scope, degrees clockwise from 12 o'clock. */
  angle: number;
  /** Small offset inside its ring, 0-1, so blips don't line up. */
  jitter: number;
  daysAgo: number;
  interview?: string;
  note: string;
}

export const DEMO_APPLICATIONS: DemoApplication[] = [
  {
    id: "northwind",
    company: "Northwind Labs",
    position: "Senior Front-end Engineer",
    status: ApplicationStatus.INTERVIEW,
    angle: 38,
    jitter: 0.4,
    daysAgo: 6,
    interview: "Technical · Thu, 14:00 · Meet link saved",
    note: "Remote, React + TypeScript. Ask about the design system team.",
  },
  {
    id: "bluefin",
    company: "Bluefin Health",
    position: "Product Designer",
    status: ApplicationStatus.PENDING,
    angle: 102,
    jitter: 0.7,
    daysAgo: 2,
    note: "Saved from their careers page in one click.",
  },
  {
    id: "copperleaf",
    company: "Copperleaf",
    position: "Full-stack Developer",
    status: ApplicationStatus.OFFERED,
    angle: 160,
    jitter: 0.5,
    daysAgo: 24,
    note: "Offer received. Compare with Northwind before Friday.",
  },
  {
    id: "atlas",
    company: "Atlas Mobility",
    position: "Mobile Engineer",
    status: ApplicationStatus.PENDING,
    angle: 214,
    jitter: 0.25,
    daysAgo: 11,
    note: "No reply yet. Follow up next week?",
  },
  {
    id: "juniper",
    company: "Juniper AI",
    position: "ML Platform Engineer",
    status: ApplicationStatus.INTERVIEW,
    angle: 268,
    jitter: 0.65,
    daysAgo: 9,
    interview: "Screening · Mon, 10:30 · Zoom link saved",
    note: "Recruiter call first. Salary range in the posting.",
  },
  {
    id: "harbor",
    company: "Harbor & Co",
    position: "QA Engineer",
    status: ApplicationStatus.REJECTED,
    angle: 318,
    jitter: 0.5,
    daysAgo: 30,
    note: "Position filled internally. Archive it when you're ready.",
  },
  {
    id: "lumen",
    company: "Lumen Studio",
    position: "UX Engineer",
    status: ApplicationStatus.PENDING,
    angle: 66,
    jitter: 0.85,
    daysAgo: 4,
    note: "Portfolio link sent with the application.",
  },
];
