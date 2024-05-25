import { Controller } from '@nestjs/common';
import { HistoryService } from './history.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { VideoViewsMetricsSyncDto } from './dto';
import { ackMessage } from '../common/utils';

@Controller()
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @EventPattern('video_views_metrics_sync')
  async handleVideoViewsMetricsSync(
    @Payload() payload: VideoViewsMetricsSyncDto,
    @Ctx() context: RmqContext,
  ) {
    await this.historyService.syncVideoViewsMetrics(payload);
    ackMessage(context);
  }
}
