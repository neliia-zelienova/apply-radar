import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateInterviewDto {
  @ApiProperty({
    description: 'The scheduled date and time of the interview (ISO 8601)',
    example: '2026-02-19T10:00:00Z',
  })
  @IsISO8601()
  scheduledAt: string;

  @ApiProperty({
    description: 'The notes of the interview',
    example: 'The interview was great',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  @Transform(trim)
  notes?: string;

  @ApiProperty({
    description: 'Interview name, e.g. Screening, Technical, Onsite',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(trim)
  name?: string;

  @ApiProperty({ description: 'Zoom/Meet/Maps/office link', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(2048)
  @Transform(trim)
  locationLink?: string;

  @ApiProperty({ description: 'Whether to send a reminder', required: false })
  @IsBoolean()
  @IsOptional()
  notifyEnabled?: boolean;

  @ApiProperty({
    description: 'Reminder offset in minutes before the interview',
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(60 * 24 * 30)
  @IsOptional()
  notifyMinutesBefore?: number;
}
