import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';

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
}
