import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class ParseApplicationFromTextDto {
  @ApiProperty({
    description:
      'Raw text containing job application information (e.g. a job posting, email, or copied job description). The AI will extract structured fields and save the application. Returns null if the text is not a job application.',
    example:
      'Senior Frontend Engineer at Stripe. We are looking for a React expert to join our payments team. Apply at https://stripe.com/jobs/123. Salary: $150k-$200k, remote-friendly.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  text!: string;

  @ApiProperty({
    description:
      'The URL of the job posting, if it can be extracted from the text. Optional but can help with later reference.',
    example: 'https://stripe.com/jobs/123',
    required: false,
  })
  @IsString()
  @MaxLength(2048)
  @IsOptional()
  @IsUrl(
    { require_protocol: true },
    { message: 'URL must be a valid URL with protocol (http:// or https://)' },
  )
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  url?: string;
}
