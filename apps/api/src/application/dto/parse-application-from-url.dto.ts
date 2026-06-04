import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

export class ParseApplicationFromUrlDto {
  @ApiProperty({
    description:
      'URL of a job posting page. The server will fetch the page content and use AI to extract the application details. If the URL contains a hash fragment (e.g. #job-123) only that section of the page is used.',
    example: 'https://jobs.example.com/senior-frontend-engineer#job-456',
  })
  @IsNotEmpty()
  @IsUrl(
    { require_protocol: true },
    { message: 'url must be a valid URL with http:// or https:// protocol' },
  )
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  url!: string;
}
