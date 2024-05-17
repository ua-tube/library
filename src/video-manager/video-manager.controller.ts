import { Controller } from '@nestjs/common';
import { VideoManagerService } from './video-manager.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UnregisterVideoDto, UpsertVideoDto } from './dto';

@Controller()
export class VideoManagerController {
  constructor(private readonly videoManagerService: VideoManagerService) {}

  @EventPattern('upsert_video')
  async handleUpsertVideo(@Payload() payload: UpsertVideoDto) {
    await this.videoManagerService.upsertVideo(payload);
  }

  @EventPattern('unregister_video')
  async handleUnregisterVideo(@Payload() payload: UnregisterVideoDto) {
    await this.videoManagerService.unregisterVideo(payload);
  }
}
