import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { InterviewInputDto } from 'src/interview/dto/interview-input.dto';
import { Application } from './entities/application.entity';
import {
  PaginationService,
  PaginationQueryDto,
  PaginationResultDto,
} from 'src/common';
import { AiService } from './ai.service';
import { ParseApplicationFromTextDto } from './dto/parse-application-from-text.dto';
import {
  ApplicationResult,
  UserApplicationDbRow,
  UserApplicationResult,
} from './application.types';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Creates an application for the user.
   *
   * A client may send its own `id` (data created offline). Re-sending an id the
   * user already owns updates that application instead of failing, so an upload
   * can be retried safely. An id that belongs to someone else is rejected (409).
   */
  async create(
    userId: string,
    body: CreateApplicationDto,
  ): Promise<Application> {
    const { id, interviews, ...fields } = body;

    if (id) {
      const existing = await this.prisma.applications.findUnique({
        where: { id },
        select: { userApplications: { select: { userId: true } } },
      });
      if (existing) {
        const ownedByUser = existing.userApplications.some(
          (ua) => ua.userId === userId,
        );
        if (!ownedByUser) {
          throw new ConflictException(`Application id ${id} is already taken`);
        }
        return this.update(id, userId, { ...fields, interviews });
      }
    }

    const applicationId = await this.prisma.$transaction(async (tx) => {
      const application = await tx.applications.create({
        data: {
          ...(id && { id }),
          ...this.toApplicationData(fields),
          name: fields.name,
          url: fields.url ?? '',
        },
      });
      await tx.userApplications.create({
        data: { userId, applicationId: application.id },
      });
      if (interviews) {
        await this.syncInterviews(tx, application.id, interviews);
      }
      return application.id;
    });

    return this.findOne(applicationId, userId);
  }

  async createFromText(
    userId: string,
    body: ParseApplicationFromTextDto,
  ): Promise<Application | null> {
    const parsed = await this.aiService.parseJobApplication(body.text);
    if (!parsed) {
      return null;
    }

    const { name, description, notes } = parsed;

    const safeName = name.trim().slice(0, 200);
    if (!safeName) {
      return null;
    }

    const safeDescription =
      typeof description === 'string' ? description.trim().slice(0, 1000) : '';
    const safeNotes =
      typeof notes === 'string' ? notes.trim().slice(0, 500) : '';

    return await this.prisma.$transaction(async (tx) => {
      const application = await tx.applications.create({
        data: {
          name: safeName,
          description: safeDescription,
          url: body.url ?? '',
          notes: safeNotes,
        },
      });
      await tx.userApplications.create({
        data: { userId, applicationId: application.id },
      });
      return application;
    });
  }

  async findAll(
    userId: string,
    query: PaginationQueryDto,
    includeInterviews: boolean = false,
    listArchived: boolean = false,
  ): Promise<PaginationResultDto<UserApplicationResult>> {
    return await this.paginationService.paginateNested(
      {
        nestedModel: this.prisma.userApplications,
        nestedWhere: {
          userId,
          application: { archived: listArchived },
        },
        nestedInclude: {
          application: {
            include: {
              ...(includeInterviews && {
                interviews: {
                  include: {
                    interview: true,
                  },
                },
              }),
              _count: {
                select: {
                  interviews: true,
                },
              },
            },
          },
        },
        nestedPath: 'application',
        searchFields: ['name', 'description'],
        defaultSortBy: 'createdAt',
        defaultSortOrder: 'desc',
        transform: (userApp: UserApplicationDbRow): UserApplicationResult => {
          const { _count, interviews, ...rest } = userApp.application;

          const application: ApplicationResult = {
            ...rest,
            interviewCount: _count.interviews,
            ...(includeInterviews && {
              interviews: (interviews ?? []).map(
                (appInterview) => appInterview.interview,
              ),
            }),
          };

          return {
            userId: userApp.userId,
            applicationId: userApp.applicationId,
            application,
          };
        },
      },
      query,
    );
  }

  async findOne(id: string, userId: string): Promise<Application> {
    const userApplication = await this.prisma.userApplications.findUnique({
      where: {
        userId_applicationId: {
          userId,
          applicationId: id,
        },
      },
      include: {
        application: {
          include: {
            interviews: {
              include: {
                interview: true,
              },
            },
            _count: {
              select: {
                interviews: true,
              },
            },
          },
        },
      },
    });

    if (!userApplication) {
      throw new NotFoundException(
        `Application with ID ${id} not found for this user`,
      );
    }

    // Flatten the nested interview structure and add interviewCount
    const { _count, interviews, ...rest } = userApplication.application;
    const application: Application = {
      ...rest,
      interviewCount: _count.interviews,
      interviews: interviews.map((appInterview) => appInterview.interview),
    };

    return application;
  }

  /**
   * Updates the given fields. When `interviews` is sent, it replaces the
   * application's interviews (missing ones are deleted). Returns the full application.
   */
  async update(
    id: string,
    userId: string,
    body: UpdateApplicationDto,
  ): Promise<Application> {
    await this.assertOwned(id, userId);
    const { interviews, ...fields } = body;

    await this.prisma.$transaction(async (tx) => {
      await tx.applications.update({
        where: { id },
        data: this.toApplicationData(fields),
      });
      if (interviews) {
        await this.syncInterviews(tx, id, interviews);
      }
    });

    return this.findOne(id, userId);
  }

  /** Deletes the application together with its interviews. */
  async remove(id: string, userId: string): Promise<{ id: string }> {
    await this.assertOwned(id, userId);

    await this.prisma.$transaction(async (tx) => {
      const links = await tx.applicationInterviews.findMany({
        where: { applicationId: id },
        select: { interviewId: true },
      });
      // Join rows cascade from both sides; the interview rows themselves don't.
      await tx.interviews.deleteMany({
        where: { id: { in: links.map((l) => l.interviewId) } },
      });
      await tx.applications.delete({ where: { id } });
    });

    return { id };
  }

  private async assertOwned(id: string, userId: string): Promise<void> {
    const userApplication = await this.prisma.userApplications.findUnique({
      where: { userId_applicationId: { userId, applicationId: id } },
    });
    if (!userApplication) {
      throw new NotFoundException(
        `Application with ID ${id} not found for this user`,
      );
    }
  }

  /**
   * Maps optional DTO fields to plain Prisma data (usable for create and update);
   * fields left undefined are not touched.
   */
  private toApplicationData(
    fields: Omit<UpdateApplicationDto, 'interviews'>,
  ): Partial<
    Omit<
      Prisma.ApplicationsCreateInput,
      'id' | 'interviews' | 'userApplications' | 'updatedAt'
    >
  > {
    return {
      ...(fields.name !== undefined && { name: fields.name }),
      ...(fields.position !== undefined && { position: fields.position }),
      ...(fields.description !== undefined && {
        description: fields.description,
      }),
      ...(fields.status !== undefined && { status: fields.status }),
      ...(fields.url !== undefined && { url: fields.url }),
      ...(fields.notes !== undefined && { notes: fields.notes }),
      ...(fields.favorite !== undefined && { favorite: fields.favorite }),
      ...(fields.archived !== undefined && { archived: fields.archived }),
      ...(fields.createdAt !== undefined && {
        createdAt: new Date(fields.createdAt),
      }),
    };
  }

  /**
   * Makes the application's interviews match `interviews`:
   * updates the ones it already has, creates new ones (keeping a client id if
   * given) and deletes the ones that are no longer listed.
   */
  private async syncInterviews(
    tx: Prisma.TransactionClient,
    applicationId: string,
    interviews: InterviewInputDto[],
  ): Promise<void> {
    const links = await tx.applicationInterviews.findMany({
      where: { applicationId },
      select: { interviewId: true },
    });
    const currentIds = new Set(links.map((l) => l.interviewId));
    const keptIds = new Set<string>();

    for (const { id, ...input } of interviews) {
      const data = {
        scheduledAt: new Date(input.scheduledAt),
        notes: input.notes ?? null,
        name: input.name ?? null,
        locationLink: input.locationLink ?? null,
      };

      if (id && currentIds.has(id)) {
        await tx.interviews.update({ where: { id }, data });
        keptIds.add(id);
        continue;
      }

      if (id) {
        // A client id must not point at an interview of another application.
        const taken = await tx.interviews.findUnique({
          where: { id },
          select: { id: true },
        });
        if (taken) {
          throw new ConflictException(`Interview id ${id} is already taken`);
        }
      }

      const created = await tx.interviews.create({
        data: {
          ...(id && { id }),
          ...data,
          applicationInterviews: { create: { applicationId } },
        },
      });
      keptIds.add(created.id);
    }

    const removedIds = [...currentIds].filter((id) => !keptIds.has(id));
    if (removedIds.length > 0) {
      await tx.interviews.deleteMany({ where: { id: { in: removedIds } } });
    }
  }
}
