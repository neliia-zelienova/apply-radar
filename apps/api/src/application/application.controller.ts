import {
  UnauthorizedException,
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
  Req,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ParseApplicationFromTextDto } from './dto/parse-application-from-text.dto';
import { PaginationQueryDto } from 'src/common';
import type { Request } from 'express';

@Controller('application')
export class ApplicationController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  async create(@Body() body: CreateApplicationDto) {
    const userId = '';
    return this.applicationService.create(userId, body);
  }

  @Post('from-text')
  async createFromText(
    @Req() req: Request,
    @Body() body: ParseApplicationFromTextDto,
  ) {
    const userId = await this.getAuthenticatedUserId(req);
    return await this.applicationService.createFromText(userId, body);
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

  private async getAuthenticatedUserId(req: Request): Promise<string> {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing access token');
    }

    const token = authorization.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    let payload: { userId?: string; sub?: string };
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }

    const userId = payload.userId ?? payload.sub;
    if (!userId) {
      throw new UnauthorizedException('Invalid access token');
    }

    return userId;
  }
}
