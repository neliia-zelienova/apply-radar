import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/** A job posting page as read by the extension in the user's own tab. */
export class ParsePageDto {
  @ApiProperty({
    description: 'URL of the page',
    example: 'https://boards.greenhouse.io/acme/jobs/123',
  })
  @IsString()
  @MaxLength(2048)
  @IsUrl(
    { require_protocol: true },
    { message: 'url must be a valid URL with protocol' },
  )
  @Transform(trim)
  url!: string;

  @ApiProperty({ description: 'Page title', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  @Transform(trim)
  title?: string;

  @ApiProperty({
    description: 'Visible text of the page (the job description)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30000)
  text!: string;
}
