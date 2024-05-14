import { Controller } from '@nestjs/common';
import { HistoryService } from './history.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { VideoViewsMetricsSyncPayload } from './types';

@Controller()
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @EventPattern('video_views_metrics_sync')
  async handleVideoViewsMetricsSync(
    @Payload() payload: VideoViewsMetricsSyncPayload,
  ) {
    await this.historyService.syncVideoViewsMetrics(payload);
  }
}
