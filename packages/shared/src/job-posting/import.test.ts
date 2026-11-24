import { describe, expect, it, vi } from "vitest";
import { importFromSnapshot, linkOnlyImport } from "./import";
import type { PageSnapshot } from "./page-snapshot";

const snapshot: PageSnapshot = {
  url: "https://jobs.example.com/42?utm_source=x",
  title: "Backend Developer at Globex",
  meta: {},
  jsonLd: [],
  text: "Remote · Full-time\nBuild APIs.",
};

describe("importFromSnapshot", () => {
  it("without AI: page data only", async () => {
    const result = await importFromSnapshot(snapshot);
    expect(result.draft).toEqual({
      name: "Globex",
      position: "Backend Developer",
      url: "https://jobs.example.com/42",
      notes: "Remote · Full-time\nAdded from link",
    });
    expect(result.notice).toMatch(/^Filled in from the page's content \(no AI\)/);
  });

  it("with AI: adds the summary and says so", async () => {
    const parsePage = vi.fn().mockResolvedValue({ summary: "Builds the billing APIs." });
    const result = await importFromSnapshot(snapshot, parsePage);
    expect(parsePage).toHaveBeenCalledWith({
      url: snapshot.url,
      title: snapshot.title,
      text: snapshot.text,
    });
    expect(result.draft.notes).toBe("Builds the billing APIs.\nRemote · Full-time\nAdded from link");
    expect(result.notice).toMatch(/with AI/);
  });

  it.each([
    [{ status: 503 }, /AI summaries aren't set up/],
    [{ status: 502 }, /AI couldn't read this page/],
  ])("AI error %o keeps the page data", async (error, notice) => {
    const result = await importFromSnapshot(snapshot, vi.fn().mockRejectedValue(error));
    expect(result.draft.name).toBe("Globex");
    expect(result.notice).toMatch(notice);
  });

  it("AI says it's not a job posting", async () => {
    const result = await importFromSnapshot(snapshot, vi.fn().mockResolvedValue(null));
    expect(result.notice).toMatch(/doesn't look like a single job posting/);
  });
});

describe("linkOnlyImport", () => {
  it("fills only the link", () => {
    const result = linkOnlyImport("https://www.linkedin.com/jobs/view/1");
    expect(result.draft).toEqual({
      name: "",
      position: "",
      url: "https://www.linkedin.com/jobs/view/1",
      notes: "Added from link",
    });
    expect(result.notice).toMatch(/Only the link was filled in/);
  });
});
