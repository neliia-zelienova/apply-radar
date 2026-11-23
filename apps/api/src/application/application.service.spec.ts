import { ConflictException, NotFoundException } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationService } from 'src/common';
import { AiService } from './ai.service';

const APP_ID = '6f1d1c1e-2b0a-4c8e-9f3e-1a2b3c4d5e6f';
const IV_ID = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d';

/** Minimal Prisma mock; `$transaction(fn)` runs `fn` with the same mock. */
const createPrismaMock = () => {
  const prisma = {
    applications: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userApplications: { findUnique: jest.fn(), create: jest.fn() },
    applicationInterviews: { findMany: jest.fn().mockResolvedValue([]) },
    interviews: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  prisma.$transaction.mockImplementation((fn: (tx: unknown) => unknown) =>
    fn(prisma),
  );
  return prisma;
};

describe('ApplicationService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: ApplicationService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new ApplicationService(
      prisma as unknown as PrismaService,
      {} as PaginationService,
      {} as AiService,
    );
    // findOne() is exercised elsewhere; here we only care about writes.
    jest
      .spyOn(service, 'findOne')
      .mockImplementation((id) => Promise.resolve({ id } as never));
  });

  describe('create', () => {
    it('creates with the client id, links the user and returns the application', async () => {
      prisma.applications.findUnique.mockResolvedValue(null);
      prisma.applications.create.mockResolvedValue({ id: APP_ID });

      await expect(
        service.create('user-1', { id: APP_ID, name: 'IKEA', url: '' }),
      ).resolves.toEqual({ id: APP_ID });

      expect(prisma.applications.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: APP_ID,
          name: 'IKEA',
          url: '',
        }) as unknown,
      });
      expect(prisma.userApplications.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', applicationId: APP_ID },
      });
    });

    it('rejects an id that belongs to another user (409)', async () => {
      prisma.applications.findUnique.mockResolvedValue({
        userApplications: [{ userId: 'someone-else' }],
      });

      await expect(
        service.create('user-1', { id: APP_ID, name: 'IKEA' }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.applications.create).not.toHaveBeenCalled();
      expect(prisma.applications.update).not.toHaveBeenCalled();
    });

    it('treats re-sending an own id as an update (safe retry)', async () => {
      prisma.applications.findUnique.mockResolvedValue({
        userApplications: [{ userId: 'user-1' }],
      });
      prisma.userApplications.findUnique.mockResolvedValue({});

      await service.create('user-1', { id: APP_ID, name: 'IKEA v2' });

      expect(prisma.applications.create).not.toHaveBeenCalled();
      expect(prisma.applications.update).toHaveBeenCalledWith({
        where: { id: APP_ID },
        data: expect.objectContaining({ name: 'IKEA v2' }) as unknown,
      });
    });
  });

  describe('update', () => {
    it("404s when the application isn't the user's", async () => {
      prisma.userApplications.findUnique.mockResolvedValue(null);
      await expect(
        service.update(APP_ID, 'user-1', { favorite: true }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('updates only the fields sent, converting the applied date', async () => {
      prisma.userApplications.findUnique.mockResolvedValue({});
      await service.update(APP_ID, 'user-1', {
        favorite: true,
        createdAt: '2026-11-10T00:00:00.000Z',
      });
      expect(prisma.applications.update).toHaveBeenCalledWith({
        where: { id: APP_ID },
        data: {
          favorite: true,
          createdAt: new Date('2026-11-10T00:00:00.000Z'),
        },
      });
    });

    it('syncs interviews: updates kept, creates new, deletes removed', async () => {
      prisma.userApplications.findUnique.mockResolvedValue({});
      prisma.applicationInterviews.findMany.mockResolvedValue([
        { interviewId: IV_ID },
        { interviewId: 'old-interview' },
      ]);
      prisma.interviews.findUnique.mockResolvedValue(null);
      prisma.interviews.create.mockResolvedValue({ id: 'new-interview' });

      await service.update(APP_ID, 'user-1', {
        interviews: [
          { id: IV_ID, scheduledAt: '2026-11-25T13:00:00.000Z', name: 'Tech' },
          { scheduledAt: '2026-11-28T10:00:00.000Z' },
        ],
      });

      expect(prisma.interviews.update).toHaveBeenCalledWith({
        where: { id: IV_ID },
        data: expect.objectContaining({ name: 'Tech' }) as unknown,
      });
      expect(prisma.interviews.create).toHaveBeenCalledTimes(1);
      expect(prisma.interviews.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['old-interview'] } },
      });
    });

    it('rejects an interview id that belongs to another application (409)', async () => {
      prisma.userApplications.findUnique.mockResolvedValue({});
      prisma.applicationInterviews.findMany.mockResolvedValue([]);
      prisma.interviews.findUnique.mockResolvedValue({ id: IV_ID });

      await expect(
        service.update(APP_ID, 'user-1', {
          interviews: [{ id: IV_ID, scheduledAt: '2026-11-25T13:00:00.000Z' }],
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.interviews.create).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes the interviews and the application', async () => {
      prisma.userApplications.findUnique.mockResolvedValue({});
      prisma.applicationInterviews.findMany.mockResolvedValue([
        { interviewId: IV_ID },
      ]);

      await expect(service.remove(APP_ID, 'user-1')).resolves.toEqual({
        id: APP_ID,
      });
      expect(prisma.interviews.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [IV_ID] } },
      });
      expect(prisma.applications.delete).toHaveBeenCalledWith({
        where: { id: APP_ID },
      });
    });
  });
});
