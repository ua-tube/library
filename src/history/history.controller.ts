import { Controller } from '@nestjs/common';
import { HistoryService } from './history.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { VideoViewsMetricsSyncDto } from './dto';

@Controller()
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @EventPattern('video_views_metrics_sync')
  async handleVideoViewsMetricsSync(
    @Payload() payload: VideoViewsMetricsSyncDto,
  ) {
    await this.historyService.syncVideoViewsMetrics(payload);
  }
}
