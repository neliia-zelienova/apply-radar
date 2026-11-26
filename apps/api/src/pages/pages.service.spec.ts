import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { PAGE_CACHE_TTL_MS, PagesService } from './pages.service';

describe('PagesService', () => {
  let service: PagesService;
  const findUnique = jest.fn();
  const about = {
    slug: 'about',
    title: 'About',
    body: '# Hi',
    updatedAt: new Date(0),
  };

  beforeEach(async () => {
    findUnique.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagesService,
        { provide: PrismaService, useValue: { pages: { findUnique } } },
      ],
    }).compile();
    service = module.get(PagesService);
  });

  it('serves a page from memory within the cache time', async () => {
    findUnique.mockResolvedValue(about);
    await expect(service.getPage('about', 1_000)).resolves.toEqual(about);
    await expect(
      service.getPage('about', 1_000 + PAGE_CACHE_TTL_MS - 1),
    ).resolves.toEqual(about);
    expect(findUnique).toHaveBeenCalledTimes(1);
  });

  it('reads the DB again after the cache time (picks up edits)', async () => {
    findUnique
      .mockResolvedValueOnce(about)
      .mockResolvedValueOnce({ ...about, body: '# Edited' });
    await service.getPage('about', 1_000);
    const page = await service.getPage('about', 1_000 + PAGE_CACHE_TTL_MS);
    expect(page.body).toBe('# Edited');
    expect(findUnique).toHaveBeenCalledTimes(2);
  });

  it('throws 404 for a missing page and does not cache the miss', async () => {
    findUnique.mockResolvedValue(null);
    await expect(service.getPage('nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.getPage('nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(findUnique).toHaveBeenCalledTimes(2);
  });
});
