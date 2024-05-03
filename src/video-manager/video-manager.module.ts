import { Module } from '@nestjs/common';
import { VideoManagerService } from './video-manager.service';
import { VideoManagerController } from './video-manager.controller';
import { PrismaModule } from '../prisma';

@Module({
  imports: [PrismaModule],
  controllers: [VideoManagerController],
  providers: [VideoManagerService],
})
export class VideoManagerModule {}
