import { Injectable, NotFoundException } from '@nestjs/common';
import { AvatarDto } from './dto/avatar.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserByOauthId(oauthId: string) {
    return this.prismaService.users.findUnique({
      where: { oauthId },
    });
  }

  async createUser(oauthId: string) {
    // Idempotent create: if the user already exists for this oauthId,
    // return it instead of throwing a unique constraint error.
    return this.prismaService.users.upsert({
      where: { oauthId },
      update: {},
      create: { oauthId },
    });
  }

  async getAvatar(id: string): Promise<AvatarDto | null> {
    const user = await this.prismaService.users.findUnique({
      where: { id },
      select: { avatar: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return (user.avatar as AvatarDto | null) ?? null;
  }

  async setAvatar(id: string, avatar: AvatarDto): Promise<AvatarDto> {
    // Store only the declared fields (the DTO instance may carry nothing else,
    // but be explicit about what goes into the JSON column).
    const value = {
      source: avatar.source,
      icon: avatar.icon,
      color: avatar.color,
      background: avatar.background,
    };
    await this.prismaService.users.update({
      where: { id },
      data: { avatar: value },
    });
    return value;
  }

  async deleteUser(id: string) {
    const user = await this.prismaService.users.delete({
      where: { id },
    });
    return user;
  }

  /**
   * Deletes the user plus their applications and those applications' interviews.
   * (Only join rows cascade from `users`, so the data rows are removed explicitly.)
   */
  async deleteUserWithData(id: string): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      const owned = await tx.userApplications.findMany({
        where: { userId: id },
        select: { applicationId: true },
      });
      const applicationIds = owned.map((o) => o.applicationId);
      const links = await tx.applicationInterviews.findMany({
        where: { applicationId: { in: applicationIds } },
        select: { interviewId: true },
      });
      await tx.interviews.deleteMany({
        where: { id: { in: links.map((l) => l.interviewId) } },
      });
      await tx.applications.deleteMany({
        where: { id: { in: applicationIds } },
      });
      await tx.users.deleteMany({ where: { id } });
    });
  }
}
