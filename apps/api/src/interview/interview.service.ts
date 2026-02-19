import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Interview } from './entities/interview.entity';

@Injectable()
export class InterviewService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    applicationId: string,
    userId: string,
    body: CreateInterviewDto,
  ): Promise<Interview> {
    // Verify user has access to the application
    const userApplication = await this.prisma.userApplications.findUnique({
      where: {
        userId_applicationId: {
          userId,
          applicationId,
        },
      },
    });

    if (!userApplication) {
      throw new NotFoundException(`Application not found for this user`);
    }

    // Create interview and link it to application using nested create
    return await this.prisma.interviews.create({
      data: {
        ...body,
        scheduledAt: body.scheduledAt ?? new Date(),
        applicationInterviews: {
          create: {
            applicationId,
          },
        },
      },
    });
  }

  async findAll(userId: string): Promise<Interview[]> {
    // Get all interviews for applications owned by the user
    const userApplications = await this.prisma.userApplications.findMany({
      where: { userId },
      select: { applicationId: true },
    });

    const applicationIds = userApplications.map((ua) => ua.applicationId);

    const applicationInterviews =
      await this.prisma.applicationInterviews.findMany({
        where: {
          applicationId: { in: applicationIds },
        },
        include: {
          interview: true,
        },
      });

    return applicationInterviews.map((ai) => new Interview(ai.interview));
  }

  async findOne(id: string, userId: string): Promise<Interview> {
    // Find interview and verify user has access through their applications
    const interview = await this.prisma.interviews.findUnique({
      where: { id },
      include: {
        applicationInterviews: {
          include: {
            application: {
              include: {
                userApplications: true,
              },
            },
          },
        },
      },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    // Check if user has access to any application linked to this interview
    const hasAccess = interview.applicationInterviews.some((ai) =>
      ai.application.userApplications.some((ua) => ua.userId === userId),
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        `You are not allowed to access this interview`,
      );
    }

    return new Interview(interview);
  }

  async update(
    id: string,
    userId: string,
    body: UpdateInterviewDto,
  ): Promise<Interview> {
    // Verify user has access to the interview
    const interview = await this.findOne(id, userId);

    // Update the interview
    const updatedInterview = await this.prisma.interviews.update({
      where: { id },
      data: {
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.scheduledAt !== undefined && {
          scheduledAt: body.scheduledAt,
        }),
      },
    });
    return new Interview(updatedInterview);
  }

  async remove(id: string, userId: string): Promise<Interview> {
    // Verify user has access to the interview
    await this.findOne(id, userId);

    // Delete the interview (cascade will handle ApplicationInterviews)
    return await this.prisma.interviews.delete({
      where: { id },
    });
  }
}
