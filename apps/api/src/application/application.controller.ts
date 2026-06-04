import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ParseApplicationFromTextDto } from './dto/parse-application-from-text.dto';
import { ParseApplicationFromUrlDto } from './dto/parse-application-from-url.dto';
import { PaginationQueryDto } from 'src/common';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  async create(@Body() body: CreateApplicationDto) {
    const userId = '';
    return this.applicationService.create(userId, body);
  }

  @Post('from-text')
  async createFromText(@Body() body: ParseApplicationFromTextDto) {
    const userId = '';
    return await this.applicationService.createFromText(userId, body);
  }

  @Post('from-url')
  async createFromUrl(@Body() body: ParseApplicationFromUrlDto) {
    const userId = '';
    return await this.applicationService.createFromUrl(userId, body);
  }

  @Get()
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('include') include?: string,
    @Query('archived') archived?: string,
  ) {
    const userId = '';
    const includeInterviews = include === 'interviews';
    const listArchived = archived === 'true';
    return this.applicationService.findAll(
      userId,
      paginationQuery,
      includeInterviews,
      listArchived,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    const userId = '';
    return this.applicationService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateApplicationDto,
  ) {
    const userId = '';
    return this.applicationService.update(id, userId, body);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    const userId = '';
    return this.applicationService.remove(id, userId);
  }
}
