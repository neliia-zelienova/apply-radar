import * as dns from 'node:dns';
import * as http from 'node:http';
import * as https from 'node:https';
import { BlockList, isIP, type LookupFunction } from 'node:net';
import * as zlib from 'node:zlib';
import { parse, type HTMLElement } from 'node-html-parser';

/**
 * Fetches a job posting page for "Add by link" (web app) and turns it into the
 * same snapshot the extension reads from a tab.
 *
 * The URL comes from the user, so this is guarded against SSRF: only http(s)
 * on the default ports, no private / loopback / link-local / metadata
 * addresses (checked at connect time, so DNS rebinding can't get around it),
 * redirects followed by hand and re-checked, a time and a size limit, HTML
 * only, no cookies.
 *
 * It's a plain server request: sites behind a login or bot protection
 * (LinkedIn, Indeed, Cloudflare checks) refuse it. That's reported as
 * `blocked`, and the extension's "From this page" remains the way for those.
 */

/** Same shape as `PageSnapshot` in @apply-radar/shared. */
export interface PageSnapshot {
  url: string;
  canonicalUrl?: string;
  title: string;
  meta: { ogTitle?: string; siteName?: string; description?: string };
  jsonLd: string[];
  text: string;
}

export type PageFetchFailure =
  | 'invalid-url'
  | 'forbidden-address'
  | 'blocked'
  | 'not-found'
  | 'not-html'
  | 'too-many-redirects'
  | 'timeout'
  | 'unreachable';

export class PageFetchError extends Error {
  constructor(
    readonly reason: PageFetchFailure,
    message: string,
  ) {
    super(message);
    this.name = 'PageFetchError';
  }
}

/** Keep in sync with PAGE_TEXT_LIMIT in @apply-radar/shared. */
export const PAGE_TEXT_LIMIT = 30_000;
const MAX_REDIRECTS = 5;
const TIMEOUT_MS = 15_000;
/** HTML beyond this is not read (job pages are far smaller; the rest is cut off). */
const MAX_HTML_BYTES = 5 * 1024 * 1024;

/** Says who's asking (no browser disguise). */
const USER_AGENT = 'Mozilla/5.0 (compatible; ApplyRadar/1.0)';

// ---------------------------------------------------------------------------
// Address guard
// ---------------------------------------------------------------------------

// Separate lists: a BlockList with the IPv4-mapped IPv6 range would match every IPv4 address.
const blockedV4 = new BlockList();
const blockedV6 = new BlockList();
for (const [network, prefix] of [
  ['0.0.0.0', 8], // "this network"
  ['10.0.0.0', 8], // private
  ['100.64.0.0', 10], // carrier-grade NAT
  ['127.0.0.0', 8], // loopback
  ['169.254.0.0', 16], // link-local, incl. cloud metadata 169.254.169.254
  ['172.16.0.0', 12], // private
  ['192.0.0.0', 24], // IETF protocol assignments
  ['192.0.2.0', 24], // documentation
  ['192.168.0.0', 16], // private
  ['198.18.0.0', 15], // benchmarking
  ['198.51.100.0', 24], // documentation
  ['203.0.113.0', 24], // documentation
  ['224.0.0.0', 4], // multicast
  ['240.0.0.0', 4], // reserved, incl. broadcast
] as const) {
  blockedV4.addSubnet(network, prefix, 'ipv4');
}
for (const [network, prefix] of [
  ['::', 128], // unspecified
  ['::1', 128], // loopback
  ['::ffff:0:0', 96], // IPv4-mapped (would bypass the IPv4 list)
  ['64:ff9b::', 96], // NAT64
  ['100::', 64], // discard
  ['2001:db8::', 32], // documentation
  ['fc00::', 7], // unique local
  ['fe80::', 10], // link-local
  ['ff00::', 8], // multicast
] as const) {
  blockedV6.addSubnet(network, prefix, 'ipv6');
}

/** True for addresses a user-supplied URL must never reach. */
export const isBlockedAddress = (address: string): boolean => {
  const family = isIP(address);
  if (family === 4) return blockedV4.check(address, 'ipv4');
  if (family === 6) return blockedV6.check(address, 'ipv6');
  return true; // not an IP at all
};

export interface PageFetchOptions {
  /** Tests only: which resolved addresses are refused (default: isBlockedAddress). */
  isBlocked?: (address: string) => boolean;
  /** Tests only: allow ports other than 80/443. */
  allowAnyPort?: boolean;
  timeoutMs?: number;
}

const forbidden = () =>
  new PageFetchError(
    'forbidden-address',
    "This link points to a private or local address, which can't be read.",
  );

/** DNS lookup that refuses blocked addresses, used by the socket itself. */
const guardedLookup =
  (isBlocked: (address: string) => boolean): LookupFunction =>
  (hostname, options, callback) => {
    dns.lookup(hostname, { ...options, all: true }, (error, addresses) => {
      if (error) return callback(error, '', 0);
      const list = addresses;
      if (list.length === 0 || list.some((entry) => isBlocked(entry.address))) {
        return callback(forbidden(), '', 0);
      }
      if (options.all) return callback(null, list, 0);
      return callback(null, list[0].address, list[0].family);
    });
  };

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

interface RawResponse {
  status: number;
  location?: string;
  contentType: string;
  body: Buffer;
}

const checkUrl = (url: URL, options: PageFetchOptions) => {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new PageFetchError(
      'invalid-url',
      'Only http and https links can be read.',
    );
  }
  if (url.username || url.password) {
    throw new PageFetchError(
      'invalid-url',
      'Links with a username or password are not supported.',
    );
  }
  if (!options.allowAnyPort && url.port !== '') {
    throw forbidden();
  }
  // IP literals skip DNS, so check them here.
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (isIP(host) && (options.isBlocked ?? isBlockedAddress)(host)) {
    throw forbidden();
  }
};

const decompress = (response: http.IncomingMessage): NodeJS.ReadableStream => {
  switch ((response.headers['content-encoding'] ?? '').toLowerCase()) {
    case 'gzip':
    case 'x-gzip':
      return response.pipe(zlib.createGunzip());
    case 'deflate':
      return response.pipe(zlib.createInflate());
    case 'br':
      return response.pipe(zlib.createBrotliDecompress());
    default:
      return response;
  }
};

const timeoutError = () =>
  new PageFetchError('timeout', 'The site took too long to respond.');

const requestOnce = (
  url: URL,
  options: PageFetchOptions,
  deadline: number,
): Promise<RawResponse> =>
  new Promise((resolve, reject) => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      reject(timeoutError());
      return;
    }
    // Settles once; a hard deadline for the whole request, so a site that
    // trickles bytes can't keep it open (a socket idle timeout wouldn't fire).
    let settled = false;
    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };
    const timer = setTimeout(() => {
      request.destroy();
      settle(() => reject(timeoutError()));
    }, remaining);

    const client = url.protocol === 'https:' ? https : http;
    const request = client.request(
      url,
      {
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        lookup: guardedLookup(options.isBlocked ?? isBlockedAddress),
        agent: false, // no shared sockets / keep-alive between users
      },
      (response) => {
        const status = response.statusCode ?? 0;
        const contentType = String(response.headers['content-type'] ?? '');
        const location = response.headers.location;
        const isHtml = /text\/html|application\/xhtml\+xml/i.test(contentType);
        if ((status >= 300 && status < 400) || status >= 400 || !isHtml) {
          // Body not needed.
          request.destroy();
          settle(() =>
            resolve({ status, location, contentType, body: Buffer.alloc(0) }),
          );
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        const stream = decompress(response);
        const finish = () =>
          settle(() =>
            resolve({ status, contentType, body: Buffer.concat(chunks) }),
          );
        stream.on('data', (chunk: Buffer) => {
          if (settled) return;
          size += chunk.length;
          chunks.push(chunk);
          if (size >= MAX_HTML_BYTES) {
            // Enough: keep what we have and stop downloading.
            finish();
            request.destroy();
          }
        });
        stream.on('end', finish);
        stream.on('error', () =>
          settle(() =>
            reject(
              new PageFetchError(
                'unreachable',
                "The page couldn't be downloaded.",
              ),
            ),
          ),
        );
      },
    );
    request.on('error', (error) => {
      settle(() =>
        reject(
          error instanceof PageFetchError
            ? error
            : new PageFetchError(
                'unreachable',
                "The site couldn't be reached. Check the link.",
              ),
        ),
      );
    });
    request.end();
  });

/** Downloads the page HTML, following redirects (each one re-checked). */
export const fetchPageHtml = async (
  rawUrl: string,
  options: PageFetchOptions = {},
): Promise<{ url: string; html: string }> => {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new PageFetchError(
      'invalid-url',
      "That doesn't look like a valid link.",
    );
  }
  const deadline = Date.now() + (options.timeoutMs ?? TIMEOUT_MS);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    checkUrl(url, options);
    const response = await requestOnce(url, options, deadline);

    if (response.status >= 300 && response.status < 400 && response.location) {
      try {
        url = new URL(response.location, url);
      } catch {
        throw new PageFetchError(
          'unreachable',
          'The site sent a broken redirect.',
        );
      }
      continue;
    }
    if ([401, 403, 407, 429, 451, 999].includes(response.status)) {
      throw new PageFetchError(
        'blocked',
        "This site doesn't let Apply Radar read its pages (it may need you to sign in).",
      );
    }
    if (response.status === 404 || response.status === 410) {
      throw new PageFetchError(
        'not-found',
        "The page wasn't found. Check the link.",
      );
    }
    if (response.status < 200 || response.status >= 300) {
      throw new PageFetchError(
        'unreachable',
        `The site answered with an error (${response.status}).`,
      );
    }
    if (!/text\/html|application\/xhtml\+xml/i.test(response.contentType)) {
      throw new PageFetchError(
        'not-html',
        "This link isn't a web page (it may be a file).",
      );
    }
    return { url: url.href, html: response.body.toString('utf8') };
  }
  throw new PageFetchError(
    'too-many-redirects',
    'The link redirects too many times.',
  );
};

// ---------------------------------------------------------------------------
// HTML -> snapshot (mirrors capturePageSnapshot in @apply-radar/shared)
// ---------------------------------------------------------------------------

const clean = (value: string) =>
  value
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const textOf = (element: HTMLElement | null | undefined) =>
  element ? clean(element.structuredText) : '';

export const snapshotFromHtml = (
  html: string,
  pageUrl: string,
): PageSnapshot => {
  const root = parse(html, {
    blockTextElements: { script: true, style: true, noscript: true, pre: true },
  });
  const attr = (selector: string, name: string) =>
    root.querySelector(selector)?.getAttribute(name)?.trim() || undefined;
  const meta = (selector: string) => attr(selector, 'content');

  const jsonLd = root
    .querySelectorAll('script[type="application/ld+json"]')
    .map((script) => script.rawText.trim())
    .filter(Boolean)
    .slice(0, 20);

  let canonicalUrl: string | undefined;
  const canonical = attr('link[rel="canonical"]', 'href');
  if (canonical) {
    try {
      canonicalUrl = new URL(canonical, pageUrl).href;
    } catch {
      canonicalUrl = undefined;
    }
  }

  const title = clean(root.querySelector('title')?.text ?? '');
  const metaTags = {
    ogTitle: meta('meta[property="og:title"]'),
    siteName: meta('meta[property="og:site_name"]'),
    description:
      meta('meta[name="description"]') ??
      meta('meta[property="og:description"]'),
  };

  // Visible text only (after reading <head>, which is removed here).
  root
    .querySelectorAll('script, style, noscript, template, svg, iframe, head')
    .forEach((element) => element.remove());
  const mainText = textOf(root.querySelector('main, [role="main"], article'));
  const text =
    mainText.length >= 500
      ? mainText
      : textOf(root.querySelector('body') ?? root);

  return {
    url: pageUrl,
    canonicalUrl,
    title,
    meta: metaTags,
    jsonLd,
    text: text.slice(0, PAGE_TEXT_LIMIT),
  };
};

/** Fetch + snapshot. Throws PageFetchError with a user-facing message. */
export const fetchPageSnapshot = async (
  url: string,
  options: PageFetchOptions = {},
): Promise<PageSnapshot> => {
  const page = await fetchPageHtml(url, options);
  return snapshotFromHtml(page.html, page.url);
};
