import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CreateApplicationDto } from './create-application.dto';
import { UpdateApplicationDto } from './update-application.dto';

// Same options as main.ts
const pipe = new ValidationPipe({ whitelist: true, transform: true });
const validate = <T>(metatype: new () => T, value: unknown): Promise<T> =>
  pipe.transform(value, { type: 'body', metatype }) as Promise<T>;

describe('CreateApplicationDto validation', () => {
  it('accepts the shapes the extension actually stores', async () => {
    const dto = await validate(CreateApplicationDto, {
      id: '6f1d1c1e-2b0a-4c8e-9f3e-1a2b3c4d5e6f',
      name: '  Picnic ',
      position: 'Front-end Engineer',
      url: '', // empty link
      notes: 'Salary | Remote [referral]', // brackets and pipes in free text
      status: 'INTERVIEW',
      favorite: true,
      archived: false,
      createdAt: '2026-11-22T09:00:00.000Z',
      interviews: [
        {
          id: '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d',
          scheduledAt: '2026-11-25T13:00:00.000Z', // ISO string, not Date
          name: 'Screening',
          locationLink: 'meet.google.com/abc',
          notifyEnabled: true,
          notifyMinutesBefore: 30,
        },
      ],
    });

    expect(dto.name).toBe('Picnic');
    expect(dto.status).toBe('INTERVIEW');
    expect(dto.interviews?.[0].scheduledAt).toBe('2026-11-25T13:00:00.000Z');
  });

  it('accepts a link without a protocol', async () => {
    await expect(
      validate(CreateApplicationDto, { name: 'IKEA', url: 'ikea.com/jobs/1' }),
    ).resolves.toBeDefined();
  });

  it('keeps status (it used to have no validator and would be stripped)', async () => {
    const dto = await validate(CreateApplicationDto, {
      name: 'IKEA',
      status: 'REJECTED',
    });
    expect(dto.status).toBe('REJECTED');
  });

  it('strips unknown fields', async () => {
    const dto = await validate(CreateApplicationDto, {
      name: 'IKEA',
      companyName: 'old field',
      userId: 'someone-else',
    });
    expect(dto).not.toHaveProperty('companyName');
    expect(dto).not.toHaveProperty('userId');
  });

  it.each([
    ['missing name', { url: 'https://x.com' }],
    ['invalid status', { name: 'IKEA', status: 'pending' }],
    ['invalid url', { name: 'IKEA', url: 'not a url' }],
    ['non-uuid id', { name: 'IKEA', id: '123' }],
    ['invalid applied date', { name: 'IKEA', createdAt: 'yesterday' }],
    ['markup in name', { name: '<script>' }],
    [
      'interview without date',
      { name: 'IKEA', interviews: [{ name: 'Screening' }] },
    ],
  ])('rejects %s', async (_label, body) => {
    await expect(validate(CreateApplicationDto, body)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('update: everything optional, id cannot be changed', async () => {
    const dto = await validate(UpdateApplicationDto, {
      favorite: true,
      id: '6f1d1c1e-2b0a-4c8e-9f3e-1a2b3c4d5e6f',
    });
    expect(dto).toEqual({ favorite: true });
  });
});
