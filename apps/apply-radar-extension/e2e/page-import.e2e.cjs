/**
 * End-to-end check of "Add from this page" with the built extension loaded in
 * Chromium and a mocked API. Serves its own job pages from ./fixtures.
 *
 *   pnpm --filter apply-radar-extension build
 *   pnpm --filter apply-radar-extension test:e2e
 *   (first time: npx playwright install chromium)
 *
 * Screenshots go to e2e/output/. The toolbar/side-panel permission prompt and
 * the native right-click menu can't be clicked by Playwright: the test points
 * "active tab" at the job page and writes the context menu hand-off itself.
 */
const { chromium } = require("playwright");
const fs = require("fs");
const http = require("http");
const path = require("path");

const EXT = path.resolve(__dirname, "../dist");
const FIXTURES = path.join(__dirname, "fixtures");
const OUT = path.join(__dirname, "output");
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const jwt = `${b64({ alg: "none" })}.${b64({ sub: "u1", name: "Alex Tester", email: "alex@example.com", exp: Math.floor(Date.now() / 1000) + 3600 })}.x`;
const results = [];
const check = (name, ok, extra = "") => results.push(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  — " + extra : ""}`);

const serveFixtures = () =>
  new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const file = path.join(FIXTURES, path.basename(new URL(req.url, "http://x").pathname));
      if (!fs.existsSync(file)) return res.writeHead(404).end();
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      fs.createReadStream(file).pipe(res);
    });
    // A dotted host: the form only accepts links with a dotted hostname.
    server.listen(0, "127.0.0.1", () => resolve(server));
  });

(async () => {
  if (!fs.existsSync(path.join(EXT, "manifest.json"))) {
    throw new Error("Build the extension first: pnpm --filter apply-radar-extension build");
  }
  fs.mkdirSync(OUT, { recursive: true });
  const server = await serveFixtures();
  const SITE = `http://127.0.0.1:${server.address().port}`;
  const context = await chromium.launchPersistentContext("", {
    channel: "chromium",
    headless: true,
    viewport: { width: 600, height: 760 },
    deviceScaleFactor: 2,
    args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`],
  });
  let sw = context.serviceWorkers()[0] || (await context.waitForEvent("serviceworker"));
  const extId = new URL(sw.url()).host;

  // Mocked API (whatever host VITE_API_URL points at).
  const api = { parsePage: { status: 200, body: null }, parseCalls: [], posts: [] };
  await context.route((url) => !url.href.startsWith(SITE) && !url.protocol.startsWith("chrome"), async (route) => {
    const req = route.request();
    const p = new URL(req.url()).pathname;
    const json = (body, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204 });
    if (p === "/auth/refresh") return json({ access_token: jwt });
    if (p === "/users/me") return json({ avatar: null });
    if (p === "/application/parse-page") { api.parseCalls.push(req.postDataJSON()); return json(api.parsePage.body, api.parsePage.status); }
    if (p.startsWith("/application") && req.method() === "GET") return json({ data: [], meta: { hasNext: false } });
    if (p === "/application" && req.method() === "POST") { const b = req.postDataJSON(); api.posts.push(b); return json({ ...b, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: "PENDING", interviews: [] }); }
    return route.continue();
  });

  // Starts in "Device only" mode (scenario 0); signs in with Google after it.
  await sw.evaluate(() => chrome.storage.local.set({ loginType: "local" }));

  const job = await context.newPage();
  const panel = await context.newPage();
  const openPanel = async (jobUrl) => {
    await job.goto(jobUrl);
    await panel.goto(`chrome-extension://${extId}/index.html`);
    await panel.getByRole("button", { name: "Add application from this page" }).waitFor();
    // In tests the extension page is itself a tab; point "active tab" at the job page.
    await panel.evaluate(async (u) => {
      const [tab] = await chrome.tabs.query({ url: u });
      chrome.tabs.query = async () => [tab];
    }, jobUrl);
  };
  const field = (label) => panel.getByLabel(label).inputValue();

  // 0. "Device only": page content only (no AI request) + a hint to log in;
  //    after logging in, applications saved on the device are copied to the account.
  await openPanel(`${SITE}/job-plain.html`);
  await panel.getByRole("button", { name: "Add application from this page" }).click();
  await panel.getByLabel("Company Name").waitFor();
  check("Device only: no AI request", api.parseCalls.length === 0);
  check("Device only: 'no AI' notice + log-in hint", (await panel.getByText("content (no AI)").isVisible()) && (await panel.getByText("Log in with Google from the account menu").isVisible()));
  await panel.screenshot({ path: `${OUT}/00-device-only.png` });
  await panel.getByRole("button", { name: "Save" }).click();
  await panel.getByLabel("Company Name").waitFor({ state: "detached" });
  const savedLocally = await sw.evaluate(() => chrome.storage.local.get("applications"));
  check("Device only: saved on the device, not sent to the API", (savedLocally.applications || []).some((a) => a.name === "Globex") && api.posts.length === 0);
  // Log in (same storage the Google sign-in writes), reopen the panel.
  await sw.evaluate((token) => chrome.storage.local.set({ loginType: "google", jwt: token }), jwt);
  await panel.reload();
  const copied = await panel.getByText(/Copied 1 application/).waitFor({ timeout: 10000 }).then(() => true, () => false);
  check("After logging in, device applications are copied to the account", copied && api.posts.length === 1 && api.posts[0].name === "Globex", `posts=${api.posts.length}`);
  await panel.screenshot({ path: `${OUT}/00b-copied-after-login.png` });
  api.posts.length = 0;
  api.parseCalls.length = 0;

  // 1. JSON-LD page + AI result
  api.parsePage = { status: 200, body: { result: { company: "Evil Corp", position: "Front-end Engineer (AI)", workMode: "hybrid", employmentType: "full-time", location: "Amsterdam, Netherlands", summary: "Build the ordering experience in React and TypeScript." } } };
  await openPanel(`${SITE}/job-jsonld.html`);
  await panel.getByRole("button", { name: "Add application from this page" }).click();
  await panel.getByLabel("Company Name").waitFor();
  const notes1 = await panel.getByLabel("Application Notes").inputValue();
  check("JSON-LD wins over AI for company/position", (await field("Company Name")) === "Picnic" && (await field("Position")) === "Senior Front-end Engineer", `${await field("Company Name")} / ${await field("Position")}`);
  check("Link is the canonical page URL", (await field("Application Link")) === `${SITE}/job-jsonld.html`);
  check("Notes: AI summary, details, 'Added from link'", notes1 === "Build the ordering experience in React and TypeScript.\nHybrid · Full-time · Amsterdam, NL\nAdded from link", JSON.stringify(notes1));
  check("Page text sent to the AI endpoint", api.parseCalls.length === 1 && api.parseCalls[0].text.includes("ordering experience") && api.parseCalls[0].url.endsWith("/job-jsonld.html"));
  check("AI notice shown", await panel.getByText("Filled in from the page with AI").isVisible());
  await panel.screenshot({ path: `${OUT}/01-form-from-jsonld-page.png` });
  await panel.getByRole("button", { name: "Save" }).click();
  await panel.getByLabel("Company Name").waitFor({ state: "detached" });
  check("Save creates the application", api.posts.length === 1 && api.posts[0].name === "Picnic" && api.posts[0].notes.endsWith("Added from link"));

  // 2. Page without structured data, AI not configured (503)
  api.parsePage = { status: 503, body: { statusCode: 503, message: "AI parsing is not configured" } };
  await openPanel(`${SITE}/job-plain.html`);
  await panel.getByRole("button", { name: "Add application from this page" }).click();
  await panel.getByLabel("Company Name").waitFor();
  const notes2 = await panel.getByLabel("Application Notes").inputValue();
  check("Title fallback: 'Position at Company'", (await field("Company Name")) === "Globex" && (await field("Position")) === "Backend Developer");
  check("Text fallback: remote + part-time", notes2 === "Remote · Part-time\nAdded from link", JSON.stringify(notes2));
  check("No-AI notice shown", await panel.getByText("AI summaries aren't set up").isVisible());
  await panel.screenshot({ path: `${OUT}/02-form-no-ai.png` });
  await panel.getByRole("button", { name: "Cancel" }).click();
  await panel.getByRole("button", { name: "Discard", exact: true }).click();

  // 3. Unreadable page (chrome://) shows an error banner
  await panel.evaluate(() => { chrome.tabs.query = async () => [{ id: 999999, url: "chrome://settings" }]; });
  await panel.getByRole("button", { name: "Add application from this page" }).click();
  await panel.getByText("This page can't be read").waitFor();
  check("Unreadable page shows an error", true);
  await panel.screenshot({ path: `${OUT}/03-unreadable-page.png` });
  await panel.getByRole("button", { name: "Dismiss" }).click();
  // Header menu (light theme): just a screenshot for review.
  await panel.getByRole("button", { name: "Account and settings" }).click();
  await panel.getByText("Log out").waitFor();
  await panel.screenshot({ path: `${OUT}/03b-settings-menu.png` });
  await panel.keyboard.press("Escape");

  // 4. Context menu hand-off: background stores the page, the panel opens the form
  api.parsePage = { status: 200, body: { result: null } };
  await sw.evaluate(async (u) => {
    const [tab] = await chrome.tabs.query({ url: u });
    // Same call the context menu handler makes (activeTab is granted by the real click).
    const [r] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => ({ url: location.href, title: document.title, meta: {}, jsonLd: [], text: document.body.innerText }) });
    await chrome.storage.session.set({ pendingPageImport: { id: "t1", snapshot: r.result } });
  }, `${SITE}/job-plain.html`);
  await panel.getByLabel("Company Name").waitFor({ timeout: 5000 });
  check("Context-menu hand-off opens the pre-filled form", (await field("Company Name")) === "Globex");
  check("'Not a job posting' notice when AI says so", await panel.getByText("doesn't look like a single job posting").isVisible());
  const left = await sw.evaluate(() => chrome.storage.session.get("pendingPageImport"));
  check("Hand-off is consumed", !left.pendingPageImport);

  // 4b. A second context-menu page while that form is open waits: the user's edits stay.
  await panel.getByLabel("Position").fill("Edited by the user");
  await sw.evaluate(() => chrome.storage.session.set({ pendingPageImport: { id: "t2", snapshot: { url: "https://jobs.initech.example/7", title: "Data Engineer at Initech", meta: {}, jsonLd: [], text: "" } } }));
  await panel.waitForTimeout(1000);
  const waiting = await sw.evaluate(() => chrome.storage.session.get("pendingPageImport"));
  check("Open form isn't replaced by a new context-menu page", (await field("Position")) === "Edited by the user" && waiting.pendingPageImport?.id === "t2", `${await field("Position")} / ${waiting.pendingPageImport?.id}`);
  await panel.getByRole("button", { name: "Cancel" }).click();
  await panel.getByRole("button", { name: "Discard", exact: true }).click();
  await panel.waitForFunction(() => [...document.querySelectorAll("input")].some((i) => i.value === "Initech"), null, { timeout: 5000 }).catch(() => undefined);
  check("…it opens once the form is closed", (await field("Company Name")) === "Initech" && (await field("Position")) === "Data Engineer");
  await panel.getByRole("button", { name: "Cancel" }).click();
  const discardQueued = panel.getByRole("button", { name: "Discard", exact: true });
  if (await discardQueued.isVisible().catch(() => false)) await discardQueued.click();
  await panel.getByLabel("Company Name").waitFor({ state: "detached" });

  // 5. Context menu item exists (onInstalled ran in the module worker)
  const menuOk = await sw.evaluate(() => chrome.contextMenus.update("apply-radar-add-from-page", { title: "Add this job to Apply Radar" }).then(() => true, (e) => String(e)));
  check("Context menu item registered", menuOk === true, String(menuOk));

  const manifest = await sw.evaluate(() => chrome.runtime.getManifest());
  check("Manifest: activeTab + module worker + optional hosts", manifest.permissions.includes("activeTab") && manifest.background.type === "module" && manifest.optional_host_permissions.includes("https://*/*"));

  // 6. On the web dashboard itself, "From this page" is hidden (and comes back elsewhere)
  const bundle = [EXT, path.join(EXT, "assets")]
    .filter((dir) => fs.existsSync(dir))
    .flatMap((dir) => fs.readdirSync(dir).filter((f) => f.endsWith(".js")).map((f) => fs.readFileSync(path.join(dir, f), "utf8")))
    .join("\n");
  // WEB_APP_URL as built (from VITE_WEB_APP_URL).
  const WEB = (bundle.match(/"(https?:\/\/[^"]+)"\.replace\(\/\\\/\+\$\/,""\)/) || [])[1];
  const pageButton = panel.getByRole("button", { name: "Add application from this page" });
  if (!WEB) {
    check("Hidden on the web app", false, "WEB_APP_URL not found in the bundle");
  } else {
    const showTab = (u) => panel.evaluate((url) => { chrome.tabs.query = async () => [{ id: 1, url }]; }, u);
    await showTab(`${WEB}/`);
    await job.goto(`${WEB}/`).catch(() => {}); // the navigation fires tabs.onUpdated -> re-check
    const hidden = await pageButton.waitFor({ state: "detached", timeout: 5000 }).then(() => true, () => false);
    check("'From this page' hidden on the web app", hidden, WEB);
    await panel.screenshot({ path: `${OUT}/04-on-web-app.png` });
    await showTab(`${SITE}/job-plain.html`);
    await job.goto(`${SITE}/job-plain.html`);
    const back = await pageButton.waitFor({ timeout: 5000 }).then(() => true, () => false);
    check("…and shown again on other pages", back);
  }

  console.log(results.join("\n"));
  await context.close();
  server.close();
  if (results.some((line) => line.startsWith("FAIL"))) process.exit(1);
})().catch((e) => {
  console.log(results.join("\n"));
  console.error(e);
  process.exit(1);
});
