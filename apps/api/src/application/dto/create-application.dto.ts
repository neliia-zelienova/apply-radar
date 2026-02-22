import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  Matches,
  IsUrl,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApplicationStatus } from 'src/generated/prisma/enums';

export class CreateApplicationDto {
  @ApiProperty({
    description: 'The name of the application',
    example: 'Google',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^[^<>{}[\]\\|`]*$/, {
    message: 'Name contains invalid characters',
  })
  name: string;

  @ApiProperty({
    description: 'The description of the application',
    example: 'Google is a company that makes search engines',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^[^<>{}[\]\\|`]*$/, {
    message: 'Description contains invalid characters',
  })
  description?: string;

  @ApiProperty({
    description: 'The status of the application',
    example: 'PENDING',
  })
  status: ApplicationStatus;

  @ApiProperty({
    description: 'The URL of the application',
    example: 'https://www.google.com',
  })
  @IsUrl(
    { require_protocol: true },
    { message: 'URL must be a valid URL with protocol (http:// or https://)' },
  )
  @IsNotEmpty()
  @MaxLength(2048)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  url: string;

  @ApiProperty({
    description: 'The notes of the application',
    example: 'Google is a company that makes search engines',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^[^<>{}[\]\\|`]*$/, {
    message: 'Notes contains invalid characters',
  })
  notes?: string;
}
