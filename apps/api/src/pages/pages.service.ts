import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface ContentPage {
  slug: string;
  title: string;
  /** Markdown */
  body: string;
  updatedAt: Date;
}

/** How long a page is served from memory; a DB edit shows up within this time. */
export const PAGE_CACHE_TTL_MS = 60_000;

/**
 * Public content pages (/about, /extension). They're edited directly in the DB,
 * so they're cached for a short time only. Misses aren't cached, so requests
 * for made-up slugs can't grow the cache.
 */
@Injectable()
export class PagesService {
  private readonly cache = new Map<
    string,
    { page: ContentPage; expiresAt: number }
  >();

  constructor(private readonly prismaService: PrismaService) {}

  async getPage(slug: string, now = Date.now()): Promise<ContentPage> {
    const cached = this.cache.get(slug);
    if (cached && cached.expiresAt > now) return cached.page;

    const page = await this.prismaService.pages.findUnique({ where: { slug } });
    if (!page) {
      this.cache.delete(slug);
      throw new NotFoundException(`No page "${slug}"`);
    }
    this.cache.set(slug, { page, expiresAt: now + PAGE_CACHE_TTL_MS });
    return page;
  }
}
