import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import {
  PaginationResultDto,
  PaginationMetaDto,
} from '../dto/pagination-result.dto';

type PrismaModelDelegate = {
  findMany: (args: any) => Promise<any[]>;
  count: (args: any) => Promise<number>;
};

type SortableField = string;
type SearchableFields = string[];

export interface PaginationOptions<T> {
  model: PrismaModelDelegate;
  where?: any;
  include?: any;
  select?: any;
  searchFields?: SearchableFields; // Fields to search in (e.g., ['name', 'title'])
  defaultSortBy?: SortableField;
  defaultSortOrder?: 'asc' | 'desc';
  transform?: (item: any) => T; // Optional transformation function
}

export interface NestedPaginationOptions<T> {
  nestedModel: PrismaModelDelegate;
  nestedWhere?: any;
  nestedInclude?: any;
  nestedSelect?: any;
  nestedPath: string; // Path to the nested model (e.g., 'application')
  searchFields?: SearchableFields;
  defaultSortBy?: SortableField;
  defaultSortOrder?: 'asc' | 'desc';
  transform?: (item: any) => T;
}

@Injectable()
export class PaginationService {
  async paginate<T = any>(
    options: PaginationOptions<T>,
    query: PaginationQueryDto,
  ): Promise<PaginationResultDto<T>> {
    const {
      model,
      where = {},
      include,
      select,
      searchFields = ['name', 'title'],
      defaultSortBy = 'createdAt',
      defaultSortOrder = 'desc',
      transform,
    } = options;

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ?? defaultSortBy;
    const sortOrder = query.sortOrder ?? defaultSortOrder;

    // Build search filter if search term is provided
    const searchFilter = query.search
      ? {
          OR: searchFields.map((field) => ({
            [field]: {
              contains: query.search,
              mode: 'insensitive' as const,
            },
          })),
        }
      : {};

    // Combine all where conditions
    const finalWhere = {
      ...where,
      ...searchFilter,
    };

    // Build orderBy
    const orderBy = this.buildOrderBy(sortBy, sortOrder);

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      model.findMany({
        where: finalWhere,
        include,
        select,
        orderBy,
        skip,
        take: limit,
      }),
      model.count({
        where: finalWhere,
      }),
    ]);

    // Transform data if transform function is provided
    const transformedData = transform ? data.map(transform) : data;

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const meta: PaginationMetaDto = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return {
      data: transformedData,
      meta,
    };
  }

  /**
   * Helper method to paginate nested relations (e.g., userApplications with applications)
   */
  async paginateNested<T = any>(
    options: NestedPaginationOptions<T>,
    query: PaginationQueryDto,
  ): Promise<PaginationResultDto<T>> {
    const {
      nestedModel,
      nestedWhere = {},
      nestedInclude,
      nestedSelect,
      nestedPath,
      searchFields = ['name', 'title'],
      defaultSortBy = 'createdAt',
      defaultSortOrder = 'desc',
      transform,
    } = options;

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ?? defaultSortBy;
    const sortOrder = query.sortOrder ?? defaultSortOrder;

    // Build search filter for nested model
    const searchFilter = query.search
      ? {
          [nestedPath]: {
            OR: searchFields.map((field) => ({
              [field]: {
                contains: query.search,
                mode: 'insensitive' as const,
              },
            })),
          },
        }
      : {};

    // Combine all where conditions
    const finalWhere = {
      ...nestedWhere,
      ...searchFilter,
    };

    // Build orderBy for nested model
    const orderBy = {
      [nestedPath]: this.buildOrderBy(sortBy, sortOrder),
    };

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      nestedModel.findMany({
        where: finalWhere,
        include: nestedInclude,
        select: nestedSelect,
        orderBy,
        skip,
        take: limit,
      }),
      nestedModel.count({
        where: finalWhere,
      }),
    ]);

    // Transform data if transform function is provided
    const transformedData = transform ? data.map(transform) : data;

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const meta: PaginationMetaDto = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return {
      data: transformedData,
      meta,
    };
  }

  private buildOrderBy(
    sortBy: string,
    sortOrder: 'asc' | 'desc',
  ): Record<string, 'asc' | 'desc'> | Record<string, Record<string, 'asc' | 'desc'>> {
    // Handle nested sorting (e.g., 'application.createdAt')
    if (sortBy.includes('.')) {
      const [parent, field] = sortBy.split('.');
      return {
        [parent]: {
          [field]: sortOrder,
        },
      };
    }

    return {
      [sortBy]: sortOrder,
    };
  }
}
