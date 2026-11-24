import { describe, expect, it } from "vitest";
import {
  ADDED_FROM_LINK_NOTE,
  applicationDraftFrom,
  buildImportNotes,
  draftFromJsonLd,
  draftFromSnapshot,
  draftFromText,
  draftFromTitle,
  jobLinkFrom,
  mergeDrafts,
} from "./job-posting";
import type { PageSnapshot } from "./page-snapshot";

const jobPosting = {
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: "Senior Front-end Engineer &amp; Designer",
  hiringOrganization: { "@type": "Organization", name: "Picnic" },
  employmentType: ["FULL_TIME"],
  jobLocation: {
    "@type": "Place",
    address: { addressLocality: "Amsterdam", addressCountry: "NL" },
  },
};

const snapshot = (overrides: Partial<PageSnapshot> = {}): PageSnapshot => ({
  url: "https://jobs.example.com/123?utm_source=x&ref=y",
  title: "",
  meta: {},
  jsonLd: [],
  text: "",
  ...overrides,
});

describe("draftFromJsonLd", () => {
  it("reads a JobPosting", () => {
    expect(draftFromJsonLd([JSON.stringify(jobPosting)])).toEqual({
      company: "Picnic",
      position: "Senior Front-end Engineer & Designer",
      employmentType: "full-time",
      location: "Amsterdam, NL",
    });
  });

  it("finds it inside @graph and skips invalid blocks", () => {
    const graph = { "@graph": [{ "@type": "WebPage" }, { ...jobPosting, "@type": ["JobPosting"] }] };
    expect(draftFromJsonLd(["{not json", JSON.stringify(graph)])?.company).toBe("Picnic");
  });

  it("maps TELECOMMUTE to remote and free-text employment types", () => {
    const remote = { ...jobPosting, jobLocationType: "TELECOMMUTE", employmentType: "Part-time" };
    expect(draftFromJsonLd([JSON.stringify(remote)])).toMatchObject({
      workMode: "remote",
      employmentType: "part-time",
    });
  });

  it("returns undefined without a JobPosting", () => {
    expect(draftFromJsonLd([JSON.stringify({ "@type": "Organization" })])).toBeUndefined();
  });
});

describe("draftFromTitle", () => {
  it.each([
    ["Acme hiring Senior Engineer in Amsterdam | LinkedIn", undefined, { company: "Acme", position: "Senior Engineer" }],
    ["Backend Developer at Globex", undefined, { company: "Globex", position: "Backend Developer" }],
    ["Front-end Engineer - Initech", undefined, { company: "Initech", position: "Front-end Engineer" }],
    ["Data Analyst | Indeed.com", "Indeed", { position: "Data Analyst" }],
    ["Platform Engineer", "Umbrella", { position: "Platform Engineer", company: "Umbrella" }],
  ])("%s", (title, siteName, expected) => {
    expect(draftFromTitle(title, siteName)).toEqual(expected);
  });
});

describe("draftFromText", () => {
  it("takes the earliest work mode / employment type near the top", () => {
    expect(
      draftFromText("", "Amsterdam · Hybrid\nFull-time\n…we also have remote days and part-time options"),
    ).toEqual({ workMode: "hybrid", employmentType: "full-time" });
  });
});

describe("mergeDrafts / draftFromSnapshot", () => {
  it("earlier sources win per field", () => {
    expect(mergeDrafts({ company: "A" }, { company: "B", position: "P" })).toEqual({
      company: "A",
      position: "P",
    });
  });

  it("prefers structured data, then AI, then guesses", () => {
    const draft = draftFromSnapshot(
      snapshot({
        title: "Wrong Title - Wrong Co",
        jsonLd: [JSON.stringify(jobPosting)],
        text: "Remote friendly team",
      }),
      { position: "AI position", workMode: "hybrid", summary: "Builds the checkout." },
    );
    expect(draft).toEqual({
      company: "Picnic",
      position: "Senior Front-end Engineer & Designer",
      employmentType: "full-time",
      location: "Amsterdam, NL",
      workMode: "hybrid",
      summary: "Builds the checkout.",
    });
  });
});

describe("jobLinkFrom", () => {
  it("uses a same-site canonical URL when it only drops tracking params", () => {
    expect(
      jobLinkFrom({
        url: "https://jobs.example.com/123?utm_source=x&trk=abc&gh_src=1",
        canonicalUrl: "https://jobs.example.com/jobs/123?utm_medium=z",
      }),
    ).toBe("https://jobs.example.com/jobs/123");
  });

  it("keeps the page URL when the canonical would lose which job it was", () => {
    expect(
      jobLinkFrom({
        url: "https://www.linkedin.com/jobs/collections/recommended/?currentJobId=42&trk=x",
        canonicalUrl: "https://www.linkedin.com/jobs/collections/recommended/",
      }),
    ).toBe("https://www.linkedin.com/jobs/collections/recommended/?currentJobId=42");
  });

  it("drops tracking params without a canonical URL", () => {
    expect(jobLinkFrom({ url: "https://jobs.example.com/123?utm_source=x&ref=y" })).toBe(
      "https://jobs.example.com/123?ref=y",
    );
  });

  it("keeps the page URL when the canonical drops the job's #fragment", () => {
    expect(
      jobLinkFrom({
        url: "https://jobs.example.com/#/jobs/42",
        canonicalUrl: "https://jobs.example.com/",
      }),
    ).toBe("https://jobs.example.com/#/jobs/42");
  });

  it("ignores a canonical URL on another site", () => {
    expect(
      jobLinkFrom({ url: "https://a.example/job", canonicalUrl: "https://b.example/job" }),
    ).toBe("https://a.example/job");
  });
});

describe("buildImportNotes", () => {
  it("summary, details line, then the 'added from link' line", () => {
    expect(
      buildImportNotes({
        summary: "Own the payments UI.",
        workMode: "hybrid",
        employmentType: "full-time",
        location: "Amsterdam, NL",
      }),
    ).toBe(`Own the payments UI.\nHybrid · Full-time · Amsterdam, NL\n${ADDED_FROM_LINK_NOTE}`);
  });

  it("just the note when nothing is known", () => {
    expect(buildImportNotes({})).toBe(ADDED_FROM_LINK_NOTE);
  });

  it("shortens a long summary at a word to fit the limit", () => {
    const notes = buildImportNotes({ summary: "word ".repeat(200), workMode: "remote" }, 100);
    expect(notes.length).toBeLessThanOrEqual(100);
    expect(notes).toMatch(/word…\nRemote\nAdded from link$/);
  });

  it("shortens a details line that alone is too long", () => {
    const notes = buildImportNotes({
      summary: "Own the UI.",
      workMode: "hybrid",
      location: "Amsterdam ".repeat(100),
    });
    const [summary, details, last] = notes.split("\n");
    expect(notes.length).toBeLessThanOrEqual(500);
    expect(summary).toBe("Own the UI.");
    expect(details.length).toBeLessThanOrEqual(150);
    expect(details).toMatch(/^Hybrid · Amsterdam .*Amsterdam…$/);
    expect(last).toBe(ADDED_FROM_LINK_NOTE);
  });

  it("fits a tiny limit even when the details alone exceed it", () => {
    const notes = buildImportNotes({ location: "Amsterdam ".repeat(100) }, 60);
    expect(notes.length).toBeLessThanOrEqual(60);
    expect(notes).toMatch(/…\nAdded from link$/);
  });
});

describe("applicationDraftFrom", () => {
  it("maps to form fields", () => {
    expect(applicationDraftFrom({ company: "Picnic", position: "Engineer" }, "https://x.example")).toEqual({
      name: "Picnic",
      position: "Engineer",
      url: "https://x.example",
      notes: ADDED_FROM_LINK_NOTE,
    });
  });
});
