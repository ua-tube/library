import { Module } from '@nestjs/common';
import { VideoStoreService } from './video-store.service';
import { VideoStoreController } from './video-store.controller';

@Module({
  controllers: [VideoStoreController],
  providers: [VideoStoreService],
})
export class VideoStoreModule {}
