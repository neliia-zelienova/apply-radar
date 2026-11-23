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
  UseGuards,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ParseApplicationFromTextDto } from './dto/parse-application-from-text.dto';
import { ParsePageDto } from './dto/parse-page.dto';
import { AiService } from './ai.service';
import { PaginationQueryDto } from 'src/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Controller('application')
@UseGuards(JwtAuthGuard)
export class ApplicationController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly aiService: AiService,
  ) {}

  @Post()
  create(@CurrentUser() userId: string, @Body() body: CreateApplicationDto) {
    return this.applicationService.create(userId, body);
  }

  @Post('from-text')
  createFromText(
    @CurrentUser() userId: string,
    @Body() body: ParseApplicationFromTextDto,
  ) {
    return this.applicationService.createFromText(userId, body);
  }

  /**
   * Reads a job posting page with AI and returns the fields for the
   * "Add application" form. Saves nothing (the user reviews first).
   * `result` is null when the page isn't a job posting; 503 when AI isn't configured.
   */
  @Post('parse-page')
  @HttpCode(200)
  async parsePage(@Body() body: ParsePageDto) {
    return { result: await this.aiService.parseJobPostingPage(body) };
  }

  @Get()
  findAll(
    @CurrentUser() userId: string,
    @Query() paginationQuery: PaginationQueryDto,
    @Query('include') include?: string,
    @Query('archived') archived?: string,
  ) {
    return this.applicationService.findAll(
      userId,
      paginationQuery,
      include === 'interviews',
      archived === 'true',
    );
  }

  @Get(':id')
  findOne(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.applicationService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateApplicationDto,
  ) {
    return this.applicationService.update(id, userId, body);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.applicationService.remove(id, userId);
  }
}
