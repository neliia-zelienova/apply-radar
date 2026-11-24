import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

/** "Add by link": a job posting URL the user pasted in the web app. */
export class FetchPageDto {
  @ApiProperty({
    description: 'Link to the job posting',
    example: 'https://boards.greenhouse.io/acme/jobs/123',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(2048)
  @IsUrl(
    { require_protocol: true, protocols: ['http', 'https'] },
    { message: 'Enter a full link, starting with https://' },
  )
  url!: string;
}
