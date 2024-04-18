import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma';
import { LibraryService } from './library.service';
import { HealthController, LibraryController } from './controllers';

@Module({
  imports: [PrismaModule],
  controllers: [LibraryController, HealthController],
  providers: [LibraryService],
})
export class LibraryModule {}
