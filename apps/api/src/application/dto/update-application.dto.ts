import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateApplicationDto } from './create-application.dto';

/** All create fields are optional on update; the id comes from the URL. */
export class UpdateApplicationDto extends PartialType(
  OmitType(CreateApplicationDto, ['id'] as const),
) {}
