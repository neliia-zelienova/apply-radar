import { Module, Global } from '@nestjs/common';
import { PaginationService } from './pagination/pagination.service';

@Global()
@Module({
  providers: [PaginationService],
  exports: [PaginationService],
})
export class CommonModule {}
