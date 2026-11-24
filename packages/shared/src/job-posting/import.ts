import type { Application } from "../types/application";
import {
  applicationDraftFrom,
  draftFromSnapshot,
  jobLinkFrom,
  type JobPostingDraft,
} from "./job-posting";
import type { PageSnapshot } from "./page-snapshot";

/** What the "Add application" form is pre-filled with. */
export type ApplicationDraft = Pick<Application, "name" | "position" | "url" | "notes">;

export interface PageImport {
  draft: ApplicationDraft;
  /** Shown above the form: where the values came from. */
  notice: string;
}

/** The API's AI reader (`api.applications.parsePage`). */
export type ParsePage = (page: {
  url: string;
  title: string;
  text: string;
}) => Promise<JobPostingDraft | null>;

const hasStatus = (error: unknown, status: number) =>
  typeof error === "object" && error !== null && (error as { status?: unknown }).status === status;

/**
 * Snapshot of a job posting page -> pre-filled form + notice. Used by the
 * extension ("From this page") and the web app ("Add by link").
 *
 * With `parsePage` (signed in with Google), the AI adds a short summary and
 * fills gaps; the page's own job data (schema.org) still wins. Without it, or
 * when the AI fails, the page's job data and title are used.
 */
export const importFromSnapshot = async (
  snapshot: PageSnapshot,
  parsePage?: ParsePage | null,
): Promise<PageImport> => {
  let ai: JobPostingDraft | null = null;
  // Without AI: the page's job data (schema.org), title and text are used.
  let notice = "Filled in from the page's content (no AI). Check the details before saving.";

  const text = snapshot.text || snapshot.meta.description || snapshot.title;
  if (parsePage && text) {
    try {
      ai = await parsePage({ url: snapshot.url, title: snapshot.title, text });
      notice = ai
        ? "Filled in from the page with AI. Check the details before saving."
        : "This page doesn't look like a single job posting. Filled in what could be found.";
    } catch (error) {
      notice = hasStatus(error, 503)
        ? "Filled in from the page's job data (AI summaries aren't set up). Check the details before saving."
        : "AI couldn't read this page, so only the page's job data was used. Check the details before saving.";
    }
  }

  return {
    draft: applicationDraftFrom(draftFromSnapshot(snapshot, ai), jobLinkFrom(snapshot)),
    notice,
  };
};

/** The form with only the link filled in, when the page couldn't be read. */
export const linkOnlyImport = (url: string, reason?: string): PageImport => ({
  draft: applicationDraftFrom({}, url),
  notice: `${reason ? `${reason} ` : ""}Only the link was filled in: add the company and position yourself.`,
});
