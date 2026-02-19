import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class Interview {
  constructor(partial: Partial<Interview>) {
    Object.assign(this, partial);
  }

  @ApiProperty({
    description: 'The ID of the interview',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'The notes of the interview',
    example: 'The interview was great',
  })
  notes: string | null;

  @ApiProperty({
    description: 'The scheduled date and time of the interview',
    example: '2026-02-19T10:00:00Z',
  })
  scheduledAt: Date;

  @ApiProperty({
    description: 'The created at date of the interview',
    example: '2021-01-01',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The updated at date of the interview',
    example: '2021-01-01',
  })
  updatedAt: Date;
}
