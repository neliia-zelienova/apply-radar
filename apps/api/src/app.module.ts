import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplicationModule } from './application/application.module';
import { InterviewModule } from './interview/interview.module';
import { CommonModule } from './common/common.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, CommonModule, ApplicationModule, InterviewModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
