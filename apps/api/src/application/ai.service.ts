import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ParsedApplicationData {
  name: string;
  description?: string;
  notes?: string;
}

/** Max characters of page text forwarded to the AI to stay within token limits. */
const MAX_PAGE_TEXT_LENGTH = 15_000;

/**
 * Extracts readable text from raw HTML.
 * If `fragment` is provided, narrows to the subtree rooted at id="fragment"
 * before stripping tags.
 */
function extractTextFromHtml(html: string, fragment?: string): string {
  let source = html;

  // Remove <script> and <style> blocks entirely (including content).
  source = source.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  source = source.replace(/<style[\s\S]*?<\/style>/gi, ' ');

  if (fragment) {
    // Find the element carrying id="fragment" (single or double quotes).
    const anchorRe = new RegExp(
      `id=["']${fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`,
      'i',
    );
    const anchorMatch = anchorRe.exec(source);
    if (anchorMatch) {
      // Narrow to everything from the anchor onward.
      source = source.slice(anchorMatch.index);
    }
  }

  // Strip all remaining HTML tags.
  source = source.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities.
  source = source
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&nbsp;/gi, ' ');

  // Collapse whitespace.
  source = source.replace(/\s+/g, ' ').trim();

  return source.slice(0, MAX_PAGE_TEXT_LENGTH);
}

const SYSTEM_PROMPT = `You are a job application data extractor.

Your task is to analyse the provided text and determine whether it describes a job application, job posting, or job offer directed at a candidate.

## If the text IS a job application or job posting:

Extract structured data and return JSON in this EXACT format:
{
  "result": {
    "name": "<company name combined with role, e.g. 'Software Engineer at Acme Corp'>",
    "description": "<concise summary of the role: responsibilities, requirements, team. Max 1000 characters>",
    "notes": "<key practical details not covered above: salary range, location/remote policy, tech stack, application deadline, benefits. Max 500 characters>"
  }
}

## If the text is NOT a job application or job posting:

Return:
{
  "result": null
}

## Rules:
- "name" is REQUIRED. Max 200 characters. Must clearly identify the role and company.
- "description" is optional but strongly preferred. Max 1000 characters. Do not copy-paste — summarise.
- "notes" is optional. Max 500 characters. Only include information not already captured in name or description.
- Do NOT invent or hallucinate data that is not present in the provided text.
- Return ONLY valid JSON. No markdown fences, no extra commentary.`;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Fetches the page at `url`, strips HTML tags, and returns plain text.
   * If the URL contains a hash fragment, only the subtree of the matching
   * element is used so that multi-listing pages are scoped correctly.
   */
  async fetchPageText(url: string): Promise<string> {
    const parsed = new URL(url);
    const fragment = parsed.hash ? parsed.hash.slice(1) : undefined;

    // Fetch without the fragment (browsers don't send # to servers).
    const pageUrl = `${parsed.origin}${parsed.pathname}${parsed.search}`;

    const response = await fetch(pageUrl, {
      headers: {
        // Mimic a browser so pages don't return a bot-detection block page.
        'User-Agent':
          'Mozilla/5.0 (compatible; ApplyRadarBot/1.0; +https://apply-radar.app)',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch URL ${pageUrl}: HTTP ${response.status}`,
      );
    }

    const html = await response.text();
    return extractTextFromHtml(html, fragment);
  }

  async parseJobApplication(
    text: string,
  ): Promise<ParsedApplicationData | null> {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const model =
      this.configService.get<string>('ANTHROPIC_MODEL') ?? 'claude-haiku-4-5';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: text }],
        temperature: 0,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(`Anthropic API error ${response.status}: ${errorBody}`);
      throw new Error(
        `AI service request failed with status ${response.status}`,
      );
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };

    const content = data.content?.find((block) => block.type === 'text')?.text;
    if (!content) {
      throw new Error('AI service returned an empty response');
    }

    const raw = JSON.parse(content) as unknown;

    if (
      typeof raw !== 'object' ||
      raw === null ||
      !('result' in raw) ||
      (raw.result !== null && typeof raw.result !== 'object')
    ) {
      throw new Error('AI service returned an unexpected response shape');
    }

    const result = (raw as { result: Record<string, unknown> | null }).result;
    if (result === null) {
      return null;
    }

    const name = typeof result['name'] === 'string' ? result['name'] : '';
    const description =
      typeof result['description'] === 'string'
        ? result['description']
        : undefined;
    const notes =
      typeof result['notes'] === 'string' ? result['notes'] : undefined;

    return { name, description, notes };
  }
}
