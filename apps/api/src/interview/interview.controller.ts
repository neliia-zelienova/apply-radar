import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { InterviewService } from './interview.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { Interview } from './entities/interview.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Controller('interview')
@UseGuards(JwtAuthGuard)
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post('application/:applicationId')
  create(
    @CurrentUser() userId: string,
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() body: CreateInterviewDto,
  ): Promise<Interview> {
    return this.interviewService.create(applicationId, userId, body);
  }

  @Get()
  findAll(@CurrentUser() userId: string): Promise<Interview[]> {
    return this.interviewService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Interview> {
    return this.interviewService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInterviewDto: UpdateInterviewDto,
  ): Promise<Interview> {
    return this.interviewService.update(id, userId, updateInterviewDto);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.interviewService.remove(id, userId);
  }
}
