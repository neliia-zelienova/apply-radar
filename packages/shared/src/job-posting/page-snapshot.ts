/**
 * What we read from a job posting page in the user's own browser tab.
 * No request is made to the site: the extension reads the page the user is
 * already looking at, so login walls and bot checks don't apply.
 */
export interface PageSnapshot {
  url: string;
  /** `<link rel="canonical">`, when the page has one (cleaner than tracking URLs). */
  canonicalUrl?: string;
  title: string;
  /** og:title / og:site_name / description meta tags. */
  meta: { ogTitle?: string; siteName?: string; description?: string };
  /** Raw contents of `<script type="application/ld+json">` blocks (schema.org JobPosting lives here). */
  jsonLd: string[];
  /** Visible text of the main content, whitespace-collapsed. */
  text: string;
}

/** Upper bound for the page text we keep (job descriptions are far shorter). */
export const PAGE_TEXT_LIMIT = 30_000;

/**
 * Runs **inside the page** via `chrome.scripting.executeScript({ func })`.
 * Chrome serializes the function source, so it must be self-contained:
 * no imports, no outer variables, no helpers defined outside it.
 */
export function capturePageSnapshot(): PageSnapshot {
  const limit = 30_000; // keep in sync with PAGE_TEXT_LIMIT (outer constants aren't available here)
  const meta = (selector: string) =>
    document.querySelector(selector)?.getAttribute("content")?.trim() || undefined;
  const clean = (value: string) =>
    value
      .replace(/[ \t ]+/g, " ")
      .replace(/\s*\n\s*/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  // Prefer the main content; fall back to the whole page when "main" is tiny
  // (some sites put the job outside it).
  const main = document.querySelector("main, [role='main'], article") as HTMLElement | null;
  const mainText = main ? clean(main.innerText || "") : "";
  const text = mainText.length >= 500 ? mainText : clean(document.body?.innerText || "");

  return {
    url: location.href,
    canonicalUrl:
      (document.querySelector("link[rel='canonical']") as HTMLLinkElement | null)?.href ||
      undefined,
    title: document.title || "",
    meta: {
      ogTitle: meta("meta[property='og:title']"),
      siteName: meta("meta[property='og:site_name']"),
      description: meta("meta[name='description']") || meta("meta[property='og:description']"),
    },
    jsonLd: Array.from(document.querySelectorAll("script[type='application/ld+json']"))
      .map((script) => script.textContent || "")
      .filter(Boolean)
      .slice(0, 20),
    text: text.slice(0, limit),
  };
}
