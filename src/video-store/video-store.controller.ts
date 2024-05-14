import { Controller } from '@nestjs/common';
import { VideoStoreService } from './video-store.service';

@Controller()
export class VideoStoreController {
  constructor(private readonly videoStoreService: VideoStoreService) {}
}
