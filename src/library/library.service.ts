import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import {
  CreatePlaylistDto,
  PaginationDto,
  SortVideosDto,
  UpdatePlaylistDto,
} from './dto';
import { buildPlaylistQueryBody, paginate } from './utils';
import { isUUID } from 'class-validator';

@Injectable()
export class LibraryService {
  private readonly logger = new Logger(LibraryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createPlaylist(dto: CreatePlaylistDto, creatorId: string) {
    return this.prisma.playlist.create({
      data: {
        creatorId,
        ...dto,
        PlaylistMetrics: {
          create: {
            itemsCount: 0,
            viewsCount: 0,
          },
        },
      },
    });
  }

  async updatePlaylist(playlistId: string, dto: UpdatePlaylistDto) {
    if (!dto.title && !dto.description && !dto.visibility)
      throw new BadRequestException('Invalid payload');

    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      select: { id: true },
    });

    if (!playlist) throw new BadRequestException('Playlist is not found');

    return this.prisma.playlist.update({
      where: { id: playlistId },
      data: dto,
    });
  }

  async deletePlaylist(playlistId: string) {
    try {
      return await this.prisma.playlist.delete({
        where: { id: playlistId },
      });
    } catch (e) {
      this.logger.error(e);
      throw new BadRequestException('Playlist not found');
    }
  }

  async getLikedPlaylist(creatorId: string, pagination: PaginationDto) {
    const result = await this.prisma.likedPlaylist.findUnique({
      where: { creatorId },
      include: { LikedPlaylistItems: buildPlaylistQueryBody(pagination) },
    });

    return paginate({
      data: result?.LikedPlaylistItems || [],
      count: result?.itemsCount || 0,
      ...pagination,
    });
  }

  async getDislikedPlaylist(creatorId: string, pagination: PaginationDto) {
    const result = await this.prisma.dislikedPlaylist.findUnique({
      where: { creatorId },
      include: { DislikedPlaylistItems: buildPlaylistQueryBody(pagination) },
    });

    return paginate({
      data: result?.DislikedPlaylistItems || [],
      count: result?.itemsCount || 0,
      ...pagination,
    });
  }

  async getWatchLaterPlaylist(creatorId: string, pagination: PaginationDto) {
    const result = await this.prisma.watchLaterPlaylist.findUnique({
      where: { creatorId },
      include: { WatchLaterPlaylistItems: buildPlaylistQueryBody(pagination) },
    });

    return paginate({
      data: result?.WatchLaterPlaylistItems || [],
      count: result?.itemsCount || 0,
      ...pagination,
    });
  }

  async getPlaylist(playlistId: string, pagination: PaginationDto) {
    if (!isUUID(playlistId, 4)) {
      throw new BadRequestException('Specified playlist ID is not uuid v4');
    }

    const result = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      select: {
        id: true,
        title: true,
        description: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
        Creator: true,
        PlaylistItems: buildPlaylistQueryBody(pagination),
        PlaylistMetrics: true,
      },
    });

    return paginate({
      data:
        result?.PlaylistItems?.map(
          (x) =>
            (x.Video.VideoMetrics.viewsCount =
              `${x.Video.VideoMetrics.viewsCount}` as any),
        ) || [],
      count: result?.PlaylistMetrics.itemsCount || 0,
      ...pagination,
    });
  }

  async voteVideo(creatorId: string, videoId: string, voteType: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: {
        LikedPlaylistItems: { where: { likedPlaylistId: creatorId } },
        DislikedPlaylistItems: { where: { dislikedPlaylistId: creatorId } },
      },
    });

    if (!video) throw new BadRequestException('Video not found');

    const likedExists = video.LikedPlaylistItems.some(
      (x) => x.videoId === videoId,
    );
    const dislikedExists = video.DislikedPlaylistItems.some(
      (x) => x.videoId === videoId,
    );

    switch (voteType) {
      case 'None':
        if (!likedExists && !dislikedExists)
          throw new BadRequestException('Video does not have votes yet');
        likedExists
          ? await this.removeFromLikedPlaylist(creatorId, videoId)
          : await this.removeFromDislikedPlaylist(creatorId, videoId);
        break;
      case 'Like':
        if (likedExists) throw new BadRequestException('Already liked');
        await this.addToLikedPlaylist(creatorId, videoId, dislikedExists);
        break;
      case 'Dislike':
        if (dislikedExists) throw new BadRequestException('Already disliked');
        await this.addToDislikedPlaylist(creatorId, videoId, likedExists);
        break;
    }
  }

  async addToLikedPlaylist(
    creatorId: string,
    videoId: string,
    disliked: boolean,
  ) {
    await this.prisma.$transaction([
      this.prisma.likedPlaylistItem.create({
        data: { likedPlaylistId: creatorId, videoId },
      }),
      this.prisma.likedPlaylist.update({
        where: { creatorId },
        data: { itemsCount: { increment: 1 } },
      }),
      this.prisma.videoMetrics.update({
        where: { videoId },
        data: {
          likesCount: { increment: 1 },
          ...(disliked && { dislikesCount: { decrement: 1 } }),
        },
      }),
    ]);
  }

  async addToDislikedPlaylist(
    creatorId: string,
    videoId: string,
    liked: boolean,
  ) {
    await this.prisma.$transaction([
      this.prisma.dislikedPlaylistItem.create({
        data: { dislikedPlaylistId: creatorId, videoId },
      }),
      this.prisma.dislikedPlaylist.update({
        where: { creatorId },
        data: { itemsCount: { increment: 1 } },
      }),
      this.prisma.videoMetrics.update({
        where: { videoId },
        data: {
          dislikesCount: { increment: 1 },
          ...(liked && { likesCount: { decrement: 1 } }),
        },
      }),
    ]);
  }

  async addToWatchLaterPlaylist(creatorId: string, videoId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.watchLaterPlaylistItem.create({
        data: { watchLaterPlaylistId: creatorId, videoId },
      });
      await tx.watchLaterPlaylist.update({
        where: { creatorId },
        data: { itemsCount: { increment: 1 } },
      });
    });
  }

  async addToPlaylist(playlistId: string, videoId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.playlistItem.create({
        data: { playlistId, videoId },
      });
      await tx.playlistMetrics.update({
        where: { playlistId },
        data: { itemsCount: { increment: 1 } },
      });
    });
  }

  async removeFromLikedPlaylist(creatorId: string, videoId: string) {
    await this.prisma.$transaction([
      this.prisma.likedPlaylistItem.delete({
        where: {
          likedPlaylistId_videoId: {
            likedPlaylistId: creatorId,
            videoId,
          },
        },
      }),
      this.prisma.likedPlaylist.update({
        where: { creatorId },
        data: { itemsCount: { decrement: 1 } },
      }),
      this.prisma.videoMetrics.update({
        where: { videoId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);
  }

  async removeFromDislikedPlaylist(creatorId: string, videoId: string) {
    await this.prisma.$transaction([
      this.prisma.dislikedPlaylistItem.delete({
        where: {
          dislikedPlaylistId_videoId: {
            dislikedPlaylistId: creatorId,
            videoId,
          },
        },
      }),
      this.prisma.dislikedPlaylist.update({
        where: { creatorId },
        data: { itemsCount: { decrement: 1 } },
      }),
      this.prisma.videoMetrics.update({
        where: { videoId },
        data: { dislikesCount: { decrement: 1 } },
      }),
    ]);
  }

  async removeFromWatchLaterPlaylist(creatorId: string, videoId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.watchLaterPlaylistItem.delete({
        where: {
          watchLaterPlaylistId_videoId: {
            watchLaterPlaylistId: creatorId,
            videoId,
          },
        },
      });
      await tx.watchLaterPlaylist.update({
        where: { creatorId },
        data: { itemsCount: { decrement: 1 } },
      });
    });
  }

  async removeFromPlaylist(playlistId: string, videoId: string) {
    if (!isUUID(playlistId, 4)) {
      throw new BadRequestException('Specified playlist ID is not uuid v4');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.playlistItem.delete({
        where: { playlistId_videoId: { playlistId, videoId } },
      });
      await tx.playlistMetrics.update({
        where: { playlistId },
        data: { itemsCount: { decrement: 1 } },
      });
    });
  }

  async getVideoMetadata(videoId: string, creatorId?: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: {
        VideoMetrics: { omit: { videoId: true } },
      },
    });

    if (!video) return null;

    if (creatorId) {
      const [isLiked, isDisliked] = await this.prisma.$transaction([
        this.prisma.likedPlaylistItem.findUnique({
          where: {
            likedPlaylistId_videoId: {
              likedPlaylistId: creatorId,
              videoId,
            },
          },
        }),
        this.prisma.dislikedPlaylistItem.findUnique({
          where: {
            dislikedPlaylistId_videoId: {
              dislikedPlaylistId: creatorId,
              videoId,
            },
          },
        }),
      ]);

      return {
        ...video.VideoMetrics,
        userVote: isLiked ? 'Like' : isDisliked ? 'Dislike' : 'None',
      };
    } else {
      return video.VideoMetrics;
    }
  }

  async getVideo(videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: {
        VideoMetrics: true,
        Creator: true,
      },
    });

    if (!video || video.visibility !== 'Public') {
      return null;
    }

    return video;
  }

  async getVideosCount(creatorId: string) {
    return this.prisma.video.count({
      where: { creatorId, visibility: 'Public' },
    });
  }

  async getVideosTotalViews(creatorId: string) {
    const videosMetrics = await this.prisma.videoMetrics.findMany({
      where: { Video: { creatorId } },
      select: { viewsCount: true },
    });

    return videosMetrics
      .reduce(
        (accumulator, currentValue) => accumulator + currentValue.viewsCount,
        BigInt(0),
      )
      .toString();
  }

  async getVideos(
    creatorId: string,
    pagination: PaginationDto,
    sort: SortVideosDto,
  ) {
    const sortBy = sort?.sortBy ? sort.sortBy : 'createdAt';
    const sortOrder = sort?.sortOrder ? sort.sortOrder : 'desc';

    return this.prisma.video.findMany({
      where: { creatorId, visibility: 'Public' },
      omit: { creatorId: true, status: true },
      include: {
        VideoMetrics: { omit: { videoId: true } },
        Creator: true,
      },
      orderBy:
        sortBy !== 'createdAt'
          ? { VideoMetrics: { [sortBy]: sortOrder } }
          : { [sortBy]: sortOrder },
      take: pagination.perPage,
      skip: (pagination.page - 1) * pagination.perPage,
    });
  }
}
