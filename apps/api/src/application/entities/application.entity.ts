import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ValidateNested } from 'class-validator';
import { Interview } from 'src/interview/entities/interview.entity';
import { Type } from 'class-transformer';
import { ApplicationStatus } from 'src/generated/prisma/enums';

export class Application {
  constructor(partial: Partial<Application>) {
    Object.assign(this, partial);
  }

  @ApiProperty({
    description: 'The ID of the application',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'The name of the application',
    example: 'Google',
  })
  name: string;

  @ApiProperty({
    description: 'The description of the application',
    example: 'Google is a company that makes search engines',
    required: false,
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
  url: string;

  @ApiProperty({
    description: 'The notes of the application',
    example: 'Google is a company that makes search engines',
    required: false,
  })
  notes?: string;

  @ApiProperty({
    description: 'The created at date of the application',
    example: '2021-01-01',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The updated at date of the application',
    example: '2021-01-01',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Is Application archived',
    example: false,
  })
  archived: boolean;

  @ApiProperty({
    description: 'The number of interviews for this application',
    example: 3,
    required: false,
  })
  interviewCount?: number;

  @ApiProperty({
    description: 'The interviews of the application',
    example: [
      new Interview({
        id: '123e4567-e89b-12d3-a456-426614174000',
        notes: 'Interview with HR',
        scheduledAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Interview)
  interviews?: Interview[];
}
