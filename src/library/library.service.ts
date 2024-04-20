import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreatePlaylistDto, PaginationDto, UpdatePlaylistDto } from './dto';
import { buildPlaylistQueryBody, paginate } from './helpers';
import { isUUID } from 'class-validator';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LibraryService {
  private readonly logger = new Logger(LibraryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createPlaylist(dto: CreatePlaylistDto, creatorId: string) {
    await this.checkCreatorSync(creatorId);

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
    } catch {
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

  async addToLikedPlaylist(creatorId: string, videoId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.likedPlaylistItem.create({
        data: { likedPlaylistId: creatorId, videoId },
      });
      await tx.likedPlaylist.update({
        where: { creatorId },
        data: { itemsCount: { increment: 1 } },
      });
    });
  }

  async addToDislikedPlaylist(creatorId: string, videoId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.dislikedPlaylistItem.create({
        data: { dislikedPlaylistId: creatorId, videoId },
      });
      await tx.dislikedPlaylist.update({
        where: { creatorId },
        data: { itemsCount: { increment: 1 } },
      });
    });
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
    await this.prisma.$transaction(async (tx) => {
      await tx.likedPlaylistItem.delete({
        where: {
          likedPlaylistId_videoId: {
            likedPlaylistId: creatorId,
            videoId,
          },
        },
      });
      await tx.likedPlaylist.update({
        where: { creatorId },
        data: { itemsCount: { decrement: 1 } },
      });
    });
  }

  async removeFromDislikedPlaylist(creatorId: string, videoId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.dislikedPlaylistItem.delete({
        where: {
          dislikedPlaylistId_videoId: {
            dislikedPlaylistId: creatorId,
            videoId,
          },
        },
      });
      await tx.dislikedPlaylist.update({
        where: { creatorId },
        data: { itemsCount: { decrement: 1 } },
      });
    });
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

  private async checkCreatorSync(id: string) {
    const creator = await this.prisma.creator.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!creator) {
      try {
        const { data } = await axios.get(
          this.configService.get('USERS_SVC_URL'),
          {
            params: {
              userId: id,
            },
          },
        );
        await this.prisma.creator.create({
          data: {
            id,
            displayName: data.displayName,
            nickname: data.nickname,
            thumbnailUrl: data.thumbnailUrl,
          },
        });
        this.logger.log(`Creator (${id}) created`);
      } catch (e) {
        this.logger.error(e);
        throw new BadRequestException('Users service temporary unavailable');
      }
    }
  }
}
