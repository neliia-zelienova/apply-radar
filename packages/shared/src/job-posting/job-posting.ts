import type { Application } from "../types/application";
import type { PageSnapshot } from "./page-snapshot";

export type WorkMode = "remote" | "hybrid" | "onsite";
export type EmploymentType = "full-time" | "part-time" | "contract" | "internship" | "temporary";

export const WORK_MODES: readonly WorkMode[] = ["remote", "hybrid", "onsite"];
export const EMPLOYMENT_TYPES: readonly EmploymentType[] = [
  "full-time",
  "part-time",
  "contract",
  "internship",
  "temporary",
];

/** What we know about a job posting; every field is optional (the user reviews it). */
export interface JobPostingDraft {
  company?: string;
  position?: string;
  workMode?: WorkMode;
  employmentType?: EmploymentType;
  location?: string;
  /** One or two sentences (AI only). */
  summary?: string;
}

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
  temporary: "Temporary",
};

/** Last line of the notes of an application created from a page. */
export const ADDED_FROM_LINK_NOTE = "Added from link";

// ---------------------------------------------------------------------------
// schema.org JobPosting (JSON-LD) — most job boards and ATS pages embed it
// ---------------------------------------------------------------------------

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const decodeEntities = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");

const text = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const cleaned = decodeEntities(value).replace(/\s+/g, " ").trim();
    return cleaned || undefined;
  }
  if (isObject(value)) return text(value.name);
  return undefined;
};

const hasType = (node: Json, type: string) => {
  const value = node["@type"];
  return Array.isArray(value) ? value.includes(type) : value === type;
};

/** Finds the first JobPosting node in parsed JSON-LD (handles arrays and @graph). */
export const findJobPostingNode = (node: unknown): Json | undefined => {
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findJobPostingNode(item);
      if (found) return found;
    }
    return undefined;
  }
  if (!isObject(node)) return undefined;
  if (hasType(node, "JobPosting")) return node;
  return findJobPostingNode(node["@graph"]);
};

const normalizeEmploymentType = (value: unknown): EmploymentType | undefined => {
  const values = Array.isArray(value) ? value : [value];
  for (const item of values) {
    if (typeof item !== "string") continue;
    const key = item.toLowerCase().replace(/[^a-z]/g, "");
    if (key === "fulltime") return "full-time";
    if (key === "parttime") return "part-time";
    if (key.startsWith("contract")) return "contract";
    if (key.startsWith("intern")) return "internship";
    if (key === "temporary" || key === "temp") return "temporary";
  }
  return undefined;
};

const locationOf = (jobLocation: unknown): string | undefined => {
  const first = Array.isArray(jobLocation) ? jobLocation[0] : jobLocation;
  if (!isObject(first)) return text(first);
  const address = first.address;
  if (!isObject(address)) return text(address) ?? text(first.name);
  const parts = [address.addressLocality, address.addressRegion, address.addressCountry]
    .map(text)
    .filter((part): part is string => !!part);
  return [...new Set(parts)].join(", ") || undefined;
};

/** Draft from the page's JSON-LD JobPosting, if it has one. */
export const draftFromJsonLd = (blocks: string[]): JobPostingDraft | undefined => {
  for (const block of blocks) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(block);
    } catch {
      continue; // some sites ship invalid JSON-LD; ignore that block
    }
    const job = findJobPostingNode(parsed);
    if (!job) continue;
    const remote = String(job.jobLocationType ?? "").toUpperCase().includes("TELECOMMUTE");
    return compact({
      company: text(job.hiringOrganization),
      position: text(job.title),
      employmentType: normalizeEmploymentType(job.employmentType),
      workMode: remote ? ("remote" as const) : undefined,
      location: locationOf(job.jobLocation),
    });
  }
  return undefined;
};

// ---------------------------------------------------------------------------
// Fallbacks from the title and visible text (no structured data)
// ---------------------------------------------------------------------------

/** Sites whose name is not the employer. */
const JOB_BOARDS =
  /linkedin|indeed|glassdoor|greenhouse|lever|workable|ashby|smartrecruiters|workday|recruitee|personio|teamtailor|stepstone|monster|wellfound|otta|welcome to the jungle|bamboohr|jobs?\b|careers?\b/i;

const isJobBoard = (name: string | undefined) => !!name && JOB_BOARDS.test(name);

/** "Acme hiring Engineer in Amsterdam | LinkedIn", "Engineer at Acme", "Engineer - Acme". */
export const draftFromTitle = (title: string, siteName?: string): JobPostingDraft => {
  const segments = title
    .split(/\s+[|–—-]\s+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
  // Drop a trailing site name ("| LinkedIn", "- Indeed.com").
  while (segments.length > 1 && (isJobBoard(segments[segments.length - 1]) ||
    segments[segments.length - 1] === siteName)) {
    segments.pop();
  }
  const head = segments[0] ?? "";
  const siteCompany = siteName && !isJobBoard(siteName) ? siteName : undefined;

  const hiring = head.match(/^(.+?)\s+hiring\s+(.+?)(?:\s+in\s+.+)?$/i);
  if (hiring) return compact({ company: hiring[1], position: hiring[2] });

  const at = head.match(/^(.+?)\s+at\s+(.+)$/i);
  if (at) return compact({ position: at[1], company: at[2] });

  if (segments.length >= 2) return compact({ position: segments[0], company: segments[1] });
  return compact({ position: head || undefined, company: siteCompany });
};

/** The earliest of the given keywords in the text decides (job pages list these near the top). */
const firstMatch = <T extends string>(
  haystack: string,
  patterns: Array<[RegExp, T]>,
): T | undefined => {
  let best: { index: number; value: T } | undefined;
  for (const [pattern, value] of patterns) {
    const index = haystack.search(pattern);
    if (index >= 0 && (!best || index < best.index)) best = { index, value };
  }
  return best?.value;
};

/** Work mode / employment type from the top of the visible text. Weakest signal. */
export const draftFromText = (title: string, pageText: string): JobPostingDraft => {
  const head = `${title}\n${pageText.slice(0, 3000)}`;
  return compact({
    workMode: firstMatch<WorkMode>(head, [
      [/\bhybrid\b/i, "hybrid"],
      [/\b(fully remote|100% remote|remote[- ]first|remote)\b/i, "remote"],
      [/\b(on[- ]?site|in[- ]office)\b/i, "onsite"],
    ]),
    employmentType: firstMatch<EmploymentType>(head, [
      [/\bfull[- ]?time\b/i, "full-time"],
      [/\bpart[- ]?time\b/i, "part-time"],
      [/\b(contract|freelance)\b/i, "contract"],
      [/\binternship\b/i, "internship"],
      [/\btemporary\b/i, "temporary"],
    ]),
  });
};

// ---------------------------------------------------------------------------
// Combining sources and building the application draft
// ---------------------------------------------------------------------------

function compact<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  ) as T;
}

/** Earlier drafts win per field: pass the most reliable source first. */
export const mergeDrafts = (...drafts: Array<JobPostingDraft | null | undefined>): JobPostingDraft =>
  drafts.reduceRight<JobPostingDraft>((merged, draft) => ({ ...merged, ...compact(draft ?? {}) }), {});

/** Structured data from the page, then the AI result, then title/text guesses. */
export const draftFromSnapshot = (
  snapshot: PageSnapshot,
  ai?: JobPostingDraft | null,
): JobPostingDraft => {
  const title = snapshot.meta.ogTitle || snapshot.title;
  return mergeDrafts(
    draftFromJsonLd(snapshot.jsonLd),
    ai,
    draftFromTitle(title, snapshot.meta.siteName),
    draftFromText(title, snapshot.text),
  );
};

/** Query parameters that only track where a click came from. */
const isTrackingParam = (key: string) =>
  /^(utm_|trk$|trackingid$|refid$|gh_src$|lever-(source|origin)$)/i.test(key);

const withoutTracking = (url: URL) => {
  const tracking: string[] = [];
  url.searchParams.forEach((_, key) => {
    if (isTrackingParam(key)) tracking.push(key);
  });
  tracking.forEach((key) => url.searchParams.delete(key));
  return url;
};

/**
 * The posting's link, without tracking parameters. The canonical URL is used
 * only when it's on the same site and keeps every other parameter of the page
 * URL and its fragment: on list pages (LinkedIn `?currentJobId=`, Indeed
 * `?vjk=`) and hash-routed boards (`/#/jobs/42`) the canonical points at the
 * list and would lose which job it was.
 */
export const jobLinkFrom = (snapshot: Pick<PageSnapshot, "url" | "canonicalUrl">): string => {
  let page: URL;
  try {
    page = withoutTracking(new URL(snapshot.url));
  } catch {
    return snapshot.url;
  }
  if (!snapshot.canonicalUrl) return page.href;
  try {
    const canonical = withoutTracking(new URL(snapshot.canonicalUrl));
    let keepsParams = true;
    page.searchParams.forEach((value, key) => {
      if (canonical.searchParams.get(key) !== value) keepsParams = false;
    });
    const keepsFragment = !page.hash || page.hash === canonical.hash;
    return canonical.protocol.startsWith("http") &&
      canonical.hostname === page.hostname &&
      keepsParams &&
      keepsFragment
      ? canonical.href
      : page.href;
  } catch {
    return page.href;
  }
};

/** A location from page data can be a whole paragraph; keep room for the summary. */
const DETAILS_LINE_LIMIT = 150;

/** `text` cut at a word, with "…", to at most `room` characters ("" if no room). */
const shortenAtWord = (text: string, room: number): string => {
  if (text.length <= room) return text;
  if (room <= 1) return "";
  const cut = text.slice(0, room - 1);
  return `${cut.replace(/\s+\S*$/, "") || cut}…`;
};

/**
 * Notes for an imported application:
 *   <short summary>
 *   Hybrid · Full-time · Amsterdam
 *   Added from link
 * The summary is shortened (at a word) so everything fits in `limit`; so is
 * the details line if it alone is too long (a long location from page data).
 */
export const buildImportNotes = (draft: JobPostingDraft, limit = 500): string => {
  const parts = [
    draft.workMode && WORK_MODE_LABELS[draft.workMode],
    draft.employmentType && EMPLOYMENT_TYPE_LABELS[draft.employmentType],
    draft.location,
  ];
  // At most one short line, and never more than the "Added from link" line
  // (and its newline) leaves room for.
  const details = shortenAtWord(
    parts.filter(Boolean).join(" · "),
    Math.min(DETAILS_LINE_LIMIT, limit - ADDED_FROM_LINK_NOTE.length - 1),
  );
  const tail = [details, ADDED_FROM_LINK_NOTE].filter(Boolean).join("\n");
  const summary = shortenAtWord(draft.summary?.trim() ?? "", limit - tail.length - 1);
  return [summary, tail].filter(Boolean).join("\n");
};

/** Fields for the "Add application" form (the user reviews them before saving). */
export const applicationDraftFrom = (
  draft: JobPostingDraft,
  link: string,
): Pick<Application, "name" | "position" | "url" | "notes"> => ({
  name: draft.company ?? "",
  position: draft.position ?? "",
  url: link,
  notes: buildImportNotes(draft),
});
