import { Injectable } from '@nestjs/common';
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

  async deleteUser(id: string) {
    const user = await this.prismaService.users.delete({
      where: { id },
    });
    return user;
  }
}
