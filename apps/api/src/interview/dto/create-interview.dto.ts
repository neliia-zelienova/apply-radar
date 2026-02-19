import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  Matches,
  IsDate,
} from 'class-validator';

export class CreateInterviewDto {
  @ApiProperty({
    description: 'The notes of the interview',
    example: 'The interview was great',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^[^<>{}[\]\\|`]*$/, {
    message: 'Notes contains invalid characters',
  })
  notes?: string;

  @ApiProperty({
    description: 'The scheduled date and time of the interview',
    example: '2026-02-19T10:00:00Z',
  })
  @IsDate()
  @IsOptional()
  scheduledAt?: Date;
}
