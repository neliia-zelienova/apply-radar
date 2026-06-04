import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { AiService } from './ai.service';

@Module({
  controllers: [ApplicationController],
  providers: [ApplicationService, AiService],
})
export class ApplicationModule {}
