import * as http from 'node:http';
import type { AddressInfo } from 'node:net';
import * as zlib from 'node:zlib';
import {
  fetchPageHtml,
  fetchPageSnapshot,
  isBlockedAddress,
  PAGE_TEXT_LIMIT,
  PageFetchError,
  snapshotFromHtml,
} from './page-fetcher';

describe('isBlockedAddress', () => {
  it.each([
    '127.0.0.1',
    '10.1.2.3',
    '172.16.0.1',
    '192.168.1.10',
    '169.254.169.254', // cloud metadata
    '100.64.0.1',
    '0.0.0.0',
    '::1',
    '::',
    'fd00::1',
    'fe80::1',
    '::ffff:127.0.0.1',
    '::ffff:a9fe:a9fe', // 169.254.169.254, IPv4-mapped (hex)
    'not-an-ip',
  ])('blocks %s', (address) => {
    expect(isBlockedAddress(address)).toBe(true);
  });

  it.each(['93.184.215.14', '140.82.112.3', '2606:4700::6810:84e5'])(
    'allows public %s',
    (address) => {
      expect(isBlockedAddress(address)).toBe(false);
    },
  );
});

describe('fetchPageHtml guard (no request made)', () => {
  const reasonOf = async (url: string) => {
    try {
      await fetchPageHtml(url);
      return 'ok';
    } catch (error) {
      return (error as PageFetchError).reason;
    }
  };

  it.each([
    ['http://127.0.0.1/', 'forbidden-address'],
    ['http://169.254.169.254/latest/meta-data/', 'forbidden-address'],
    ['http://[::1]/', 'forbidden-address'],
    ['http://localhost/', 'forbidden-address'], // resolves to loopback
    ['https://example.com:8443/job', 'forbidden-address'], // non-default port
    ['ftp://example.com/job', 'invalid-url'],
    ['file:///etc/passwd', 'invalid-url'],
    ['https://user:pw@example.com/', 'invalid-url'],
    ['not a url', 'invalid-url'],
  ])('%s -> %s', async (url, reason) => {
    expect(await reasonOf(url)).toBe(reason);
  });
});

describe('fetchPageHtml against a local server', () => {
  let server: http.Server;
  let base: string;
  const routes: Record<string, (res: http.ServerResponse) => void> = {};
  // The test server is on 127.0.0.1: allow only that, and any port.
  const options = {
    isBlocked: (address: string) =>
      address !== '127.0.0.1' && address !== '::ffff:127.0.0.1',
    allowAnyPort: true,
    timeoutMs: 3000,
  };

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      const handler = routes[req.url ?? ''];
      if (handler) handler(res);
      else {
        res.statusCode = 404;
        res.end();
      }
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  const html = (body: string) => (res: http.ServerResponse) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(body);
  };

  it('follows a redirect and returns the final URL', async () => {
    routes['/old'] = (res) => {
      res.statusCode = 301;
      res.setHeader('Location', '/job');
      res.end();
    };
    routes['/job'] = html('<title>Job</title>');
    const page = await fetchPageHtml(`${base}/old`, options);
    expect(page.url).toBe(`${base}/job`);
    expect(page.html).toContain('<title>Job</title>');
  });

  it('refuses a redirect to a private address', async () => {
    routes['/to-metadata'] = (res) => {
      res.statusCode = 302;
      res.setHeader('Location', 'http://169.254.169.254/latest/meta-data/');
      res.end();
    };
    await expect(
      fetchPageHtml(`${base}/to-metadata`, options),
    ).rejects.toMatchObject({
      reason: 'forbidden-address',
    });
  });

  it('stops after too many redirects', async () => {
    routes['/loop'] = (res) => {
      res.statusCode = 302;
      res.setHeader('Location', '/loop');
      res.end();
    };
    await expect(fetchPageHtml(`${base}/loop`, options)).rejects.toMatchObject({
      reason: 'too-many-redirects',
    });
  });

  it('refuses non-HTML responses', async () => {
    routes['/file.pdf'] = (res) => {
      res.setHeader('Content-Type', 'application/pdf');
      res.end('%PDF');
    };
    await expect(
      fetchPageHtml(`${base}/file.pdf`, options),
    ).rejects.toMatchObject({
      reason: 'not-html',
    });
  });

  it.each([
    [999, 'blocked'], // LinkedIn
    [403, 'blocked'],
    [429, 'blocked'],
    [404, 'not-found'],
    [500, 'unreachable'],
  ])('status %i -> %s', async (status, reason) => {
    routes[`/status-${status}`] = (res) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'text/html');
      res.end('nope');
    };
    await expect(
      fetchPageHtml(`${base}/status-${status}`, options),
    ).rejects.toMatchObject({
      reason,
    });
  });

  it('decompresses gzip', async () => {
    routes['/gz'] = (res) => {
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Encoding', 'gzip');
      res.end(zlib.gzipSync('<title>Zipped</title>'));
    };
    expect((await fetchPageHtml(`${base}/gz`, options)).html).toBe(
      '<title>Zipped</title>',
    );
  });

  it('cuts an oversized page off instead of downloading all of it', async () => {
    routes['/huge'] = (res) => {
      res.setHeader('Content-Type', 'text/html');
      const chunk = 'x'.repeat(1024 * 1024);
      let sent = 0;
      const write = () => {
        // Up to 20 MB, unless the client hangs up first.
        while (sent < 20 && res.write(chunk)) sent++;
        if (sent < 20) res.once('drain', write);
        else res.end();
      };
      res.on('error', () => undefined);
      write();
    };
    const page = await fetchPageHtml(`${base}/huge`, options);
    expect(page.html.length).toBeGreaterThanOrEqual(5 * 1024 * 1024);
    expect(page.html.length).toBeLessThan(8 * 1024 * 1024);
  });

  it('times out on a site that trickles bytes forever', async () => {
    routes['/trickle'] = (res) => {
      res.setHeader('Content-Type', 'text/html');
      const timer = setInterval(() => res.write('.'), 50);
      res.on('close', () => clearInterval(timer));
    };
    const started = Date.now();
    await expect(
      fetchPageHtml(`${base}/trickle`, { ...options, timeoutMs: 300 }),
    ).rejects.toMatchObject({ reason: 'timeout' });
    expect(Date.now() - started).toBeLessThan(2000);
  });

  it('reports a broken redirect', async () => {
    routes['/bad-redirect'] = (res) => {
      res.statusCode = 302;
      res.setHeader('Location', 'http://[broken');
      res.end();
    };
    await expect(
      fetchPageHtml(`${base}/bad-redirect`, options),
    ).rejects.toMatchObject({ reason: 'unreachable' });
  });

  it('times out on a site that never answers', async () => {
    routes['/hang'] = () => undefined;
    await expect(
      fetchPageHtml(`${base}/hang`, { ...options, timeoutMs: 300 }),
    ).rejects.toMatchObject({ reason: 'timeout' });
  });

  it('fetchPageSnapshot: end to end', async () => {
    routes['/posting'] = html(
      '<html><head><title>Backend Developer at Globex</title></head><body><main><h1>Backend Developer</h1><p>Remote</p></main></body></html>',
    );
    const snapshot = await fetchPageSnapshot(`${base}/posting`, options);
    expect(snapshot.title).toBe('Backend Developer at Globex');
    expect(snapshot.text).toContain('Remote');
  });
});

describe('snapshotFromHtml', () => {
  const page = `<!doctype html>
<html><head>
  <title>Senior Engineer &amp; Lead | Acme</title>
  <meta property="og:title" content="Senior Engineer &amp; Lead">
  <meta property="og:site_name" content="Acme">
  <meta name="description" content="Join Acme">
  <link rel="canonical" href="/jobs/42">
  <script type="application/ld+json">{"@type":"JobPosting","title":"Senior Engineer"}</script>
  <style>body { color: red }</style>
</head><body>
  <nav>Menu</nav>
  <main>
    <h1>Senior Engineer</h1>
    <p>Hybrid, Amsterdam</p>
    <script>window.secret = 1</script>
    <noscript>Enable JS</noscript>
    <ul><li>TypeScript</li><li>React</li></ul>
  </main>
</body></html>`;

  it('reads title, meta, canonical and JSON-LD', () => {
    const snapshot = snapshotFromHtml(
      page,
      'https://jobs.acme.com/jobs/42?utm_source=x',
    );
    expect(snapshot).toMatchObject({
      url: 'https://jobs.acme.com/jobs/42?utm_source=x',
      canonicalUrl: 'https://jobs.acme.com/jobs/42',
      title: 'Senior Engineer & Lead | Acme',
      meta: {
        ogTitle: 'Senior Engineer & Lead',
        siteName: 'Acme',
        description: 'Join Acme',
      },
      jsonLd: ['{"@type":"JobPosting","title":"Senior Engineer"}'],
    });
  });

  it('keeps visible text only, one block per line', () => {
    const { text } = snapshotFromHtml(page, 'https://jobs.acme.com/jobs/42');
    expect(text).toContain('Senior Engineer\nHybrid, Amsterdam');
    expect(text).toContain('TypeScript');
    expect(text).not.toMatch(/secret|color: red|Enable JS/);
  });

  it('caps the text', () => {
    const long = `<body><p>${'word '.repeat(20_000)}</p></body>`;
    expect(snapshotFromHtml(long, 'https://a.example').text.length).toBe(
      PAGE_TEXT_LIMIT,
    );
  });
});
