import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AvatarDto } from './avatar.dto';

const pipe = new ValidationPipe({ whitelist: true, transform: true });
const validate = (value: unknown) =>
  pipe.transform(value, { type: 'body', metatype: AvatarDto });

const valid = {
  source: 'icon',
  icon: 'Squirrel',
  color: 'rgba(255,255,255,1)',
  background:
    'linear-gradient(90deg, rgba(13,148,136,1) 0%, rgba(20,184,166,1) 100%)',
};

describe('AvatarDto validation', () => {
  it('accepts solid colors and gradients', async () => {
    await expect(validate(valid)).resolves.toEqual(valid);
    await expect(
      validate({ ...valid, source: 'google', background: '#0d9488' }),
    ).resolves.toBeDefined();
  });

  it('strips unknown fields', async () => {
    const dto = (await validate({ ...valid, admin: true })) as object;
    expect(dto).not.toHaveProperty('admin');
  });

  it.each([
    ['unknown source', { ...valid, source: 'upload' }],
    ['non-name icon', { ...valid, icon: '<svg>' }],
    [
      'url() in background',
      { ...valid, background: 'url(https://evil.example/x.png)' },
    ],
    ['css injection in color', { ...valid, color: 'red; position: fixed' }],
    ['quotes', { ...valid, background: '"red"' }],
    ['missing color', { source: 'icon', icon: 'Cat', background: '#000' }],
  ])('rejects %s', async (_label, body) => {
    await expect(validate(body)).rejects.toBeInstanceOf(BadRequestException);
  });
});
