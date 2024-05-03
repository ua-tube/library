import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma';
import { LibraryService } from './library.service';
import { LibraryController } from './library.controller';

@Module({
  imports: [PrismaModule],
  controllers: [LibraryController],
  providers: [LibraryService],
})
export class LibraryModule {}
