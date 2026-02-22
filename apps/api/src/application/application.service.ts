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

@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
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

  async findAll(
    userId: string,
    query: PaginationQueryDto,
    includeInterviews: boolean = false,
    listArchived: boolean = false,
  ): Promise<PaginationResultDto<Application[]>> {
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
        transform: (userApp: any) => {
          const application = {
            ...userApp.application,
            interviewCount: userApp.application._count.interviews,
          };

          // Remove _count from the response
          delete (application as any)._count;

          if (includeInterviews) {
            application.interviews = userApp.application.interviews.map(
              (appInterview: any) => appInterview.interview,
            );
          }

          return {
            ...userApp,
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
    const application = {
      ...userApplication.application,
      interviewCount: userApplication.application._count.interviews,
      interviews: userApplication.application.interviews.map(
        (appInterview) => appInterview.interview,
      ),
    };

    // Remove _count from the response
    delete (application as any)._count;

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
