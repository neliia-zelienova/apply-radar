import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApplicationStatus } from 'src/generated/prisma/enums';
import { InterviewInputDto } from 'src/interview/dto/interview-input.dto';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// Names are short identifiers; keep them free of markup-ish characters.
// Free text (description, notes) is rendered escaped by the clients, so it may
// contain brackets, pipes etc. ("Salary | Remote", "[referral]").
const SAFE_NAME = /^[^<>{}[\]\\|`]*$/;

export class CreateApplicationDto {
  @ApiProperty({
    description:
      'Optional client-generated id (UUID), so data created offline keeps its id',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Company name', example: 'Google' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(trim)
  @Matches(SAFE_NAME, { message: 'Name contains invalid characters' })
  name: string;

  @ApiProperty({
    description: 'Job title',
    example: 'Front-end Engineer',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  @Transform(trim)
  @Matches(SAFE_NAME, { message: 'Position contains invalid characters' })
  position?: string;

  @ApiProperty({
    description: 'The description of the application',
    example: 'Google is a company that makes search engines',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @Transform(trim)
  description?: string;

  @ApiProperty({
    description: 'The status of the application',
    enum: ApplicationStatus,
    example: 'PENDING',
    required: false,
  })
  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;

  @ApiProperty({
    description:
      'Job posting link. May be empty; the protocol is optional (company.com/jobs/1).',
    example: 'https://www.google.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2048)
  @Transform(trim)
  // Only the empty string skips the link check; IsOptional covers absent values.
  @ValidateIf((o: CreateApplicationDto) => o.url !== '')
  @IsUrl(
    { require_protocol: false },
    { message: 'URL must be a valid link (e.g. https://company.com/job)' },
  )
  url?: string;

  @ApiProperty({
    description: 'The notes of the application',
    example: 'Referral from Anna',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  @Transform(trim)
  notes?: string;

  @ApiProperty({ description: 'Marked as favorite', required: false })
  @IsBoolean()
  @IsOptional()
  favorite?: boolean;

  @ApiProperty({ description: 'Is the application archived', required: false })
  @IsBoolean()
  @IsOptional()
  archived?: boolean;

  @ApiProperty({
    description: 'When the user applied (ISO 8601). Defaults to now.',
    example: '2026-11-15T10:00:00.000Z',
    required: false,
  })
  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @ApiProperty({
    description:
      'Interviews of the application. On update, this list replaces the existing interviews.',
    type: [InterviewInputDto],
    required: false,
  })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => InterviewInputDto)
  @IsOptional()
  interviews?: InterviewInputDto[];
}
