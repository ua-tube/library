import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { UnregisterVideoDto, UpsertVideoDto } from './dto';

@Injectable()
export class VideoManagerService {
  private readonly logger = new Logger(VideoManagerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async upsertVideo(payload: UpsertVideoDto) {
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

  async unregisterVideo(payload: UnregisterVideoDto) {
    const video = await this.prisma.video.findUnique({
      where: { id: payload.videoId },
      select: { status: true },
    });

    if (!video || video.status === 'Unregistered') return;

    await this.prisma.video.update({
      where: { id: payload.videoId },
      data: { status: 'Unregistered' },
    });
  }
}
