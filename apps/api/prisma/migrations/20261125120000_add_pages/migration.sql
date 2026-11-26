-- CreateTable
CREATE TABLE "pages" (
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("slug")
);

-- Starting content for /about and /extension (Markdown). Edit it in the DB later;
-- ON CONFLICT keeps edits if this runs against a DB that already has the rows.
INSERT INTO "pages" ("slug", "title", "body") VALUES
('about', 'About Apply Radar', $md$
Job hunting means dozens of applications, each on a different site, each at a different stage. **Apply Radar** keeps all of them on one screen, so you always know what's waiting for a reply, what's coming up next and what you can let go.

## Why it exists

Spreadsheets get out of date the moment you close them, and job boards only show their own postings. Apply Radar sits in your browser, right where you find jobs, so saving an application takes one click instead of a copy-paste session.

## What you can do

- **Save a job in one click** from the page you're reading, or paste a link in the web dashboard.
- **Track every stage**: Applied, Interview, Offer or Rejected.
- **Keep interviews in one place**: date, type (screening, technical, onsite) and the meeting link.
- **Write notes** for each application and star the ones that matter most.
- **Search, filter and sort** to find any application in seconds; archive the ones you're done with.

## Your data

- Use the extension **without an account**: applications stay on your device.
- Sign in with **Google** to sync across browsers and use the web dashboard. Your device-only applications are copied to your account when you sign in.
- We don't store your name or email, only an ID from Google that links you to your applications.
- **Delete my data** in the account menu removes all of your applications and interviews for good.
$md$),
('extension', 'The Apply Radar extension', $md$
The extension is where Apply Radar does most of its work: it opens next to the job you're reading and saves it without leaving the page.

## Add a job from any page

Open the popup (or the side panel) on a job posting and choose **Add from this page**, or right-click the page and pick **Add this job to Apply Radar**. The company, position and link are filled in for you. Check them, pick a status and save.

With a Google account, AI also writes a short summary of the role into the notes. Without one, the form is filled from the job data the page itself provides.

## Keyboard shortcuts

- **Cmd+B** (Mac) or **Ctrl+B**: open the popup
- **Cmd+Shift+O** (Mac) or **Ctrl+Shift+O**: open the side panel

## With or without an account

- **Without an account**, applications are saved in this browser only.
- **With Google**, they sync across your browsers and show up in the web dashboard. The dashboard button in the extension header opens it.

## Install

The extension isn't in the Chrome Web Store yet. To try it now:

1. Build it from the project: `pnpm --filter apply-radar-extension build` (the build lands in `apps/apply-radar-extension/dist`).
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and choose the build folder.
4. Pin Apply Radar to the toolbar.
$md$)
ON CONFLICT ("slug") DO NOTHING;
