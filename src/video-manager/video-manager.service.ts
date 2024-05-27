import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateVideoDto, UnregisterVideoDto, UpdateVideoDto } from './dto';

@Injectable()
export class VideoManagerService {
  private readonly logger = new Logger(VideoManagerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createVideo(payload: CreateVideoDto) {
    const video = await this.prisma.video.findUnique({
      where: { id: payload.id },
      select: { id: true },
    });

    if (video) {
      this.logger.warn(`[Create] Video (${payload.id}) already created`);
      return;
    }

    try {
      await this.prisma.video.create({
        data: {
          id: payload.id,
          title: payload.title,
          creatorId: payload.creatorId,
          visibility: payload.visibility,
          lengthSeconds: payload.lengthSeconds,
          status: payload.status,
          createdAt: payload.createdAt,
          metrics: {
            create: {
              viewsCount: 0,
              likesCount: 0,
              dislikesCount: 0,
            },
          },
        },
      });
      this.logger.log(`[Create] Video (${payload.id}) is created`);
    } catch {
      this.logger.error(
        `[Create] An error occurred when creating video (${payload.id})`,
      );
    }
  }

  async updateVideo(payload: UpdateVideoDto) {
    const video = await this.prisma.video.findUnique({
      where: { id: payload.id },
      select: { id: true },
    });

    if (!video) {
      this.logger.warn(`[Update] Video (${payload.id}) does not exists`);
      return;
    }

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
      this.logger.log(`[Update] Video (${payload.id}) is updated`);
    } catch {
      this.logger.error(
        `[Update] An error occurred when updating video (${payload.id})`,
      );
    }
  }

  async unregisterVideo(payload: UnregisterVideoDto) {
    const video = await this.prisma.video.findUnique({
      where: { id: payload.videoId },
      select: { status: true },
    });

    if (!video) {
      this.logger.warn(
        `[Unregister] Video (${payload.videoId}) does not exists`,
      );
      return;
    }

    if (video.status === 'Unregistered') {
      this.logger.warn(
        `[Unregister] Video (${payload.videoId}) already unregistered`,
      );
      return;
    }

    await this.prisma.video.update({
      where: { id: payload.videoId },
      data: { status: 'Unregistered' },
    });
  }
}
