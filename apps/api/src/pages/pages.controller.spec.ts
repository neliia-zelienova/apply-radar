import { NotFoundException } from '@nestjs/common';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';

describe('PagesController', () => {
  const getPage = jest.fn();
  const controller = new PagesController({
    getPage,
  } as unknown as PagesService);

  beforeEach(() => getPage.mockReset());

  it('returns the page', async () => {
    const updatedAt = new Date(0);
    getPage.mockResolvedValue({
      slug: 'about',
      title: 'About',
      body: 'Hi',
      updatedAt,
    });
    await expect(controller.getPage('about')).resolves.toEqual({
      slug: 'about',
      title: 'About',
      body: 'Hi',
      updatedAt,
    });
  });

  it.each(['About', '../x', 'a_b', '-a', 'a'.repeat(65)])(
    'rejects the invalid slug %p without a DB call',
    async (slug) => {
      await expect(controller.getPage(slug)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(getPage).not.toHaveBeenCalled();
    },
  );
});
