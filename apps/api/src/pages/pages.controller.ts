import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { PagesService } from './pages.service';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Public: no sign-in needed (the web app's /about and /extension pages). */
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get(':slug')
  // Short, so a DB edit reaches browsers within a couple of minutes.
  @Header('Cache-Control', 'public, max-age=60')
  async getPage(@Param('slug') slug: string) {
    if (slug.length > 64 || !SLUG.test(slug)) {
      throw new NotFoundException(`No page "${slug}"`);
    }
    const { title, body, updatedAt } = await this.pagesService.getPage(slug);
    return { slug, title, body, updatedAt };
  }
}
