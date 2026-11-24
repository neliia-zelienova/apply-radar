import { useRef, useState, type FormEvent } from "react";
import { Link2, Loader2 } from "lucide-react";
import {
  ApiError,
  importFromSnapshot,
  jobLinkFrom,
  linkOnlyImport,
  type Application,
  type PageImport,
  type PageSnapshot,
} from "@apply-radar/shared";
import {
  ApplicationForm,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@apply-radar/ui";
import { api } from "../api";

/** Adds https:// when the user pasted a link without it. Null if it isn't a web link. */
const normalizeLink = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.href;
  } catch {
    return null;
  }
};

/**
 * The link to save is the one the user pasted: if the site redirected (a closed
 * job to the company's job list, a sign-in page), the final page's URL and
 * canonical aren't this posting's link.
 */
const withPastedLink = (snapshot: PageSnapshot, pasted: string): PageSnapshot =>
  jobLinkFrom({ url: snapshot.url }) === jobLinkFrom({ url: pasted })
    ? snapshot
    : { ...snapshot, url: pasted, canonicalUrl: undefined };

/** Pages built in the browser by JavaScript arrive (nearly) empty. */
const looksEmpty = (snapshot: PageSnapshot) =>
  snapshot.jsonLd.length === 0 && snapshot.text.length < 200;

const EMPTY_PAGE =
  "This page loads its content with JavaScript, so it can't be read from a link.";

const messageOf = (error: unknown) =>
  error instanceof ApiError && error.status === 422
    ? error.message
    : error instanceof ApiError && error.status === 0
      ? "Can't reach the server. Check your connection and try again."
      : "Couldn't read this page.";

type Step =
  | { name: "closed" }
  | { name: "link"; error?: string; failedUrl?: string }
  | { name: "reading" }
  | { name: "review"; id: string; result: PageImport };

/**
 * "Add by link": the user pastes a job posting link, the API downloads the
 * page, and the "Add application" form opens pre-filled for review.
 *
 * Sites behind a sign-in or bot check (LinkedIn, Indeed) refuse the server;
 * then the form can still open with just the link.
 */
export const AddByLinkButton = ({
  onCreate,
}: {
  onCreate: (application: Application) => Promise<boolean>;
}) => {
  const [step, setStep] = useState<Step>({ name: "closed" });
  const [link, setLink] = useState("");
  // Ignores a result that arrives after the dialog was closed.
  const attempt = useRef(0);

  const close = () => {
    attempt.current++;
    setStep({ name: "closed" });
  };

  const review = (result: PageImport) =>
    setStep({ name: "review", id: crypto.randomUUID(), result });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const url = normalizeLink(link);
    if (!url) {
      setStep({ name: "link", error: "Enter a link to a job posting, like https://jobs.example.com/123." });
      return;
    }
    const current = ++attempt.current;
    setStep({ name: "reading" });
    try {
      const snapshot = withPastedLink(await api.applications.fetchPage(url), url);
      if (looksEmpty(snapshot)) {
        if (attempt.current === current) {
          setStep({ name: "link", error: EMPTY_PAGE, failedUrl: url });
        }
        return;
      }
      const result = await importFromSnapshot(snapshot, api.applications.parsePage);
      if (attempt.current === current) review(result);
    } catch (error) {
      if (attempt.current === current) {
        setStep({ name: "link", error: messageOf(error), failedUrl: url });
      }
    }
  };

  const dialogOpen = step.name === "link" || step.name === "reading";
  const reading = step.name === "reading";

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setLink("");
          setStep({ name: "link" });
        }}
        className="flex cursor-pointer items-center gap-1.5 rounded-full border border-teal-600/40 px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-600/10 dark:border-teal-400/40 dark:text-teal-300 dark:hover:bg-teal-400/10"
      >
        <Link2 className="h-3.5 w-3.5" />
        Add by link
      </button>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && close()}>
        <DialogContent>
          <form onSubmit={(event) => void submit(event)} noValidate>
            <DialogHeader>
              <DialogTitle>Add by link</DialogTitle>
              <DialogDescription>
                Paste a link to a job posting. Apply Radar reads the page and fills in the
                company, position and a short note for you to check.
              </DialogDescription>
            </DialogHeader>

            <label className="flex flex-col gap-1">
              <span className="text-sm">Job posting link</span>
              <input
                type="url"
                inputMode="url"
                autoFocus
                aria-label="Job posting link"
                placeholder="https://boards.greenhouse.io/company/jobs/123"
                value={link}
                disabled={reading}
                onChange={(event) => setLink(event.target.value)}
                aria-invalid={step.name === "link" && !!step.error}
                className={`w-full rounded-md border bg-teal-400/10 p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60 dark:bg-black/20 ${
                  step.name === "link" && step.error
                    ? "border-red-500"
                    : "border-black/15 dark:border-white/20"
                }`}
              />
            </label>

            {step.name === "link" && step.error && (
              <div
                role="alert"
                className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-200"
              >
                <p>{step.error}</p>
                {step.failedUrl && (
                  <>
                    <p className="mt-1 text-xs text-red-700/80 dark:text-red-200/80">
                      Open the posting in your browser and use “From this page” in the
                      Apply Radar extension: it reads the page as you see it, including
                      sites that need you to sign in (like LinkedIn).
                    </p>
                    <button
                      type="button"
                      className="mt-2 cursor-pointer text-xs font-semibold underline underline-offset-2"
                      onClick={() => review(linkOnlyImport(step.failedUrl!))}
                    >
                      Add with just the link
                    </button>
                  </>
                )}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="secondary" size="sm" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={reading || !link.trim()}>
                {reading ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Reading page…
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* The link dialog is closed by now: only one dialog at a time. */}
      {step.name === "review" && (
        <ApplicationForm
          key={step.id}
          externalOpen
          draft={step.result.draft}
          notice={step.result.notice}
          onSave={async (application) => {
            const saved = await onCreate(application);
            if (saved) setStep({ name: "closed" });
            return saved;
          }}
          onCancel={() => setStep({ name: "closed" })}
        />
      )}
    </>
  );
};
