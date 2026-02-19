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
} from '@nestjs/common';
import { InterviewService } from './interview.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { Interview } from './entities/interview.entity';

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post('application/:applicationId')
  create(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() body: CreateInterviewDto,
  ): Promise<Interview> {
    const userId = '';
    return this.interviewService.create(applicationId, userId, body);
  }

  @Get()
  async findAll(): Promise<Interview[]> {
    const userId = '';
    return this.interviewService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Interview> {
    const userId = '';
    return this.interviewService.findOne(id, userId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInterviewDto: UpdateInterviewDto,
  ): Promise<Interview> {
    const userId = '';
    return this.interviewService.update(id, userId, updateInterviewDto);
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const userId = '';
    return this.interviewService.remove(id, userId);
  }
}
