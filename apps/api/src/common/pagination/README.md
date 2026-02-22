# Pagination Service

A universal pagination utility for NestJS applications using Prisma.

## Features

- ✅ Universal - works with any Prisma model
- ✅ Sortable by any field (including nested fields)
- ✅ Searchable by name/title (configurable fields)
- ✅ Flexible filtering
- ✅ Includes/excludes relations
- ✅ Data transformation support
- ✅ Nested relation pagination support

## Usage

### Basic Example

```typescript
import { PaginationService } from 'src/common';
import { PaginationQueryDto } from 'src/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MyService {
  constructor(
    private readonly paginationService: PaginationService,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(query: PaginationQueryDto) {
    return await this.paginationService.paginate({
      model: this.prisma.applications,
      searchFields: ['name', 'description'],
      defaultSortBy: 'createdAt',
      defaultSortOrder: 'desc',
    }, query);
  }
}
```

### With Filters

```typescript
async findAll(query: PaginationQueryDto) {
  return await this.paginationService.paginate({
    model: this.prisma.applications,
    where: {
      status: 'PENDING',
    },
    searchFields: ['name'],
    defaultSortBy: 'name',
    defaultSortOrder: 'asc',
  }, query);
}
```

### With Relations

```typescript
async findAll(query: PaginationQueryDto) {
  return await this.paginationService.paginate({
    model: this.prisma.applications,
    include: {
      interviews: {
        include: {
          interview: true,
        },
      },
    },
    searchFields: ['name'],
  }, query);
}
```

### Nested Relations (e.g., UserApplications -> Applications)

```typescript
async findAll(userId: string, query: PaginationQueryDto) {
  return await this.paginationService.paginateNested({
    nestedModel: this.prisma.userApplications,
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
        },
      },
    },
    nestedPath: 'application',
    searchFields: ['name', 'description'],
    defaultSortBy: 'createdAt',
    defaultSortOrder: 'desc',
    transform: (userApp) => ({
      ...userApp,
      application: {
        ...userApp.application,
        interviews: userApp.application.interviews.map(ai => ai.interview),
      },
    }),
  }, query);
}
```

### Controller Usage

```typescript
import { Query } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common';

@Controller('applications')
export class ApplicationController {
  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    return this.applicationService.findAll(query);
  }
}
```

## Query Parameters

- `page` (number, default: 1) - Page number (1-indexed)
- `limit` (number, default: 10, max: 100) - Items per page
- `sortBy` (string) - Field to sort by (e.g., 'name', 'createdAt', 'application.name')
- `sortOrder` ('asc' | 'desc', default: 'desc') - Sort order
- `search` (string) - Search term to filter by name/title

## Response Format

```typescript
{
  data: T[],
  meta: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
    hasNext: boolean,
    hasPrev: boolean
  }
}
```

## Examples

- `GET /applications?page=1&limit=10&sortBy=name&sortOrder=asc&search=Google`
- `GET /applications?page=2&limit=20&sortBy=createdAt&sortOrder=desc`
