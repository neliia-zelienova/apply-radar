import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ParsedApplicationData {
  name: string;
  description?: string;
  notes?: string;
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
