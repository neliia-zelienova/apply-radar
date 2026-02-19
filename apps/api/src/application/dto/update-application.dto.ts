import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicationDto } from './create-application.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {
  @ApiProperty({
    description: 'Toggles application archived state',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  archived?: boolean;
}
