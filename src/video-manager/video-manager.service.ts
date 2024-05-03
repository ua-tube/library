import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { UpsertVideo } from './types';

@Injectable()
export class VideoManagerService {
  private readonly logger = new Logger(VideoManagerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async upsertVideo(payload: UpsertVideo) {
    const video = await this.prisma.video.findUnique({
      where: { id: payload.id },
      select: { id: true },
    });

    if (video) {
      try {
        await this.prisma.video.update({
          where: { id: payload.id },
          data: {
            title: payload.title,
            thumbnailUrl: payload.thumbnailUrl,
            previewThumbnailUrl: payload.previewThumbnailUrl,
            visibility: payload.visibility,
            status: payload.status,
          },
        });
        this.logger.log(`Video (${payload.id}) is updated`);
      } catch {
        this.logger.error(
          `An error occurred when updating video (${payload.id})`,
        );
      }
    } else {
      try {
        await this.prisma.video.create({
          data: {
            ...payload,
            VideoMetrics: { create: { viewsCount: 0 } },
          },
        });
        this.logger.log(`Video (${payload.id}) is created`);
      } catch {
        this.logger.error(
          `An error occurred when creating video (${payload.id})`,
        );
      }
    }
  }

  async updateVideoMetrics(videoId: string, numberToIncrement: number) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true },
    });

    if (!video) {
      throw new BadRequestException(
        `Video with id (${videoId}) does not exists`,
      );
    }

    try {
      const updated = await this.prisma.videoMetrics.update({
        where: { videoId },
        data: { viewsCount: { increment: numberToIncrement } },
      });
      this.logger.log(`Metrics for video with id (${videoId}) updated`);
      return (updated.viewsCount = `${updated.viewsCount}` as any);
    } catch (e: any) {
      this.logger.error(e);
      throw new BadRequestException(e?.code || 0);
    }
  }
}
