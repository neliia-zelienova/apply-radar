import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { CreateInterviewDto } from './create-interview.dto';

/**
 * An interview sent inside an application create/update.
 * `id` may be client-generated (UUID) so offline-created data keeps its ids.
 */
export class InterviewInputDto extends CreateInterviewDto {
  @ApiProperty({ description: 'Interview id (UUID)', required: false })
  @IsUUID()
  @IsOptional()
  id?: string;
}
