import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { UsersService } from './users.service';
import { AvatarDto } from './dto/avatar.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Settings of the signed-in user (currently the avatar; null = not chosen yet). */
  @Get('me')
  async getMe(@CurrentUser() userId: string) {
    return { avatar: await this.usersService.getAvatar(userId) };
  }

  @Put('me/avatar')
  async setAvatar(@CurrentUser() userId: string, @Body() avatar: AvatarDto) {
    return { avatar: await this.usersService.setAvatar(userId, avatar) };
  }

  /** Deletes the signed-in user and all of their applications and interviews. */
  @Delete('me')
  @HttpCode(200)
  async deleteMe(@CurrentUser() userId: string) {
    await this.usersService.deleteUserWithData(userId);
    return { deleted: true };
  }
}
