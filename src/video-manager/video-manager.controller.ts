import { Controller } from '@nestjs/common';
import { VideoManagerService } from './video-manager.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UpdateMetrics, UpsertVideo } from './types';

@Controller()
export class VideoManagerController {
  constructor(private readonly videoManagerService: VideoManagerService) {}

  @EventPattern('upsert_video')
  async handleUpsertVideo(@Payload() payload: UpsertVideo) {
    await this.videoManagerService.upsertVideo(payload);
  }

  @MessagePattern('update_metrics')
  async handleUpdateMetrics(@Payload() payload: UpdateMetrics) {
    return this.videoManagerService.updateVideoMetrics(
      payload.videoId,
      payload.numberToIncrement,
    );
  }
}
