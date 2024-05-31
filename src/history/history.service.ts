import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { VideoViewsMetricsSyncDto } from './dto';

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async syncVideoViewsMetrics(payload: VideoViewsMetricsSyncDto) {
    this.logger.log('Video metrics update is called');

    const video = await this.prisma.video.findUnique({
      where: { id: payload.videoId },
      select: {
        status: true,
        metrics: {
          select: {
            viewsCountUpdatedAt: true,
          },
        },
      },
    });

    if (!video || video.status === 'Unregistered') {
      this.logger.warn(
        `Video (${payload.videoId}) does not exist or unregistered`,
      );
      return;
    }

    if (payload.updatedAt <= video.metrics.viewsCountUpdatedAt) {
      this.logger.warn('Video metrics update is too old, skip...');
      return;
    }

    await this.prisma.videoMetrics.update({
      where: { videoId: payload.videoId },
      data: {
        viewsCount: BigInt(payload.viewsCount),
        viewsCountUpdatedAt: new Date(),
      },
    });

    this.logger.log(`Metrics updated for video (${payload.videoId})`);
  }
}
