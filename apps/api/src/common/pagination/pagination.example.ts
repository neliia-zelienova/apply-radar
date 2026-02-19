/**
 * Example usage of PaginationService
 * 
 * This file demonstrates how to use the pagination service with different models.
 * It's not meant to be imported - just a reference guide.
 */

import { PaginationService } from './pagination.service';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { PrismaService } from 'src/prisma/prisma.service';

// Example 1: Simple pagination for Applications model
async function example1(paginationService: PaginationService, prisma: PrismaService, query: PaginationQueryDto) {
  return await paginationService.paginate({
    model: prisma.applications,
    where: {
      status: 'PENDING',
    },
    searchFields: ['name', 'description'],
    defaultSortBy: 'createdAt',
    defaultSortOrder: 'desc',
  }, query);
}

// Example 2: Pagination with includes
async function example2(paginationService: PaginationService, prisma: PrismaService, query: PaginationQueryDto) {
  return await paginationService.paginate({
    model: prisma.applications,
    include: {
      interviews: {
        include: {
          interview: true,
        },
      },
    },
    searchFields: ['name'],
    defaultSortBy: 'name',
    defaultSortOrder: 'asc',
  }, query);
}

// Example 3: Pagination for nested relations (UserApplications -> Applications)
async function example3(paginationService: PaginationService, prisma: PrismaService, userId: string, query: PaginationQueryDto) {
  return await paginationService.paginateNested({
    nestedModel: prisma.userApplications,
    nestedWhere: {
      userId,
    },
    nestedInclude: {
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
    nestedPath: 'application',
    searchFields: ['name', 'description'],
    defaultSortBy: 'createdAt',
    defaultSortOrder: 'desc',
    transform: (userApp: any) => ({
      ...userApp,
      application: {
        ...userApp.application,
        interviewCount: userApp.application._count.interviews,
        interviews: userApp.application.interviews.map((ai: any) => ai.interview),
      },
    }),
  }, query);
}

// Example 4: Pagination for Interviews
async function example4(paginationService: PaginationService, prisma: PrismaService, query: PaginationQueryDto) {
  return await paginationService.paginate({
    model: prisma.interviews,
    searchFields: ['notes'],
    defaultSortBy: 'scheduledAt',
    defaultSortOrder: 'asc',
  }, query);
}
