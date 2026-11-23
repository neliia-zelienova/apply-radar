import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, Matches, MaxLength } from 'class-validator';

/**
 * CSS colors/gradients only: hex, rgb[a](), hsl[a](), linear-/radial-gradient().
 * No url(), quotes or semicolons, so a value can't load anything or escape the
 * style property it's used in.
 */
const CSS_COLOR = /^(?!.*url\s*\()[#a-z0-9(),.%\s-]+$/i;

export class AvatarDto {
  @ApiProperty({
    description: 'Show the Google photo (if any) or the chosen icon',
    enum: ['google', 'icon'],
  })
  @IsIn(['google', 'icon'])
  source: 'google' | 'icon';

  @ApiProperty({ description: 'Lucide animal icon name', example: 'Fox' })
  @IsString()
  @MaxLength(40)
  @Matches(/^[A-Za-z0-9]+$/, { message: 'icon must be an icon name' })
  icon: string;

  @ApiProperty({
    description: 'Icon stroke color',
    example: 'rgba(255,255,255,1)',
  })
  @IsString()
  @MaxLength(100)
  @Matches(CSS_COLOR, { message: 'color must be a CSS color' })
  color: string;

  @ApiProperty({
    description: 'Background: a CSS color or gradient',
    example:
      'linear-gradient(90deg, rgba(13,148,136,1) 0%, rgba(20,184,166,1) 100%)',
  })
  @IsString()
  @MaxLength(500)
  @Matches(CSS_COLOR, { message: 'background must be a CSS color or gradient' })
  background: string;
}
