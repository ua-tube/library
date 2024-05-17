import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { VideoViewsMetricsSyncDto } from './dto';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async syncVideoViewsMetrics(payload: VideoViewsMetricsSyncDto) {
    const metrics = await this.prisma.videoMetrics.findUnique({
      where: { videoId: payload.videoId },
      select: { viewsCountUpdatedAt: true },
    });

    if (payload.updatedAt <= metrics.viewsCountUpdatedAt) return;

    await this.prisma.videoMetrics.update({
      where: { videoId: payload.videoId },
      data: {
        viewsCount: BigInt(payload.viewsCount),
        viewsCountUpdatedAt: new Date(),
      },
    });
  }
}
