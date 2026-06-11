import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { PrismaService } from 'src/prisma/prisma.service';
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

  async create(
    userId: string,
    body: CreateApplicationDto,
  ): Promise<Application> {
    return await this.prisma.$transaction(async (tx) => {
      const application = await (tx as PrismaService).applications.create({
        data: body,
      });
      await (tx as PrismaService).userApplications.create({
        data: { userId, applicationId: application.id },
      });
      return application;
    });
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
      const application = await (tx as PrismaService).applications.create({
        data: {
          name: safeName,
          description: safeDescription,
          url: body.url ?? '',
          notes: safeNotes,
        },
      });
      await (tx as PrismaService).userApplications.create({
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
              interviews: interviews.map(
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

  async update(
    id: string,
    userId: string,
    body: UpdateApplicationDto,
  ): Promise<Application> {
    // Verify user has access to this application
    const userApplication = await this.prisma.userApplications.findUnique({
      where: {
        userId_applicationId: {
          userId,
          applicationId: id,
        },
      },
    });

    if (!userApplication) {
      throw new NotFoundException(
        `Application with ID ${id} not found for this user`,
      );
    }

    // Update the application (Prisma handles undefined fields automatically)
    return await this.prisma.applications.update({
      where: {
        id,
      },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.url !== undefined && { url: body.url }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });
  }

  async remove(id: string, userId: string) {
    const userApplication = await this.prisma.userApplications.findUnique({
      where: {
        userId_applicationId: {
          userId,
          applicationId: id,
        },
      },
    });

    if (!userApplication) {
      throw new NotFoundException(
        `Application with ID ${id} not found for this user`,
      );
    }

    return await this.prisma.userApplications.delete({
      where: {
        userId_applicationId: {
          userId,
          applicationId: id,
        },
      },
    });
  }
}
