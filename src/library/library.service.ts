import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { PaginationDto } from './dto';
import { buildPlaylistQueryBody, paginate } from './helpers';
import { isUUID } from 'class-validator';

@Injectable()
export class LibraryService {
  constructor(private readonly prisma: PrismaService) {}

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
        itemsCount: true,
        createdAt: true,
        updatedAt: true,
        Creator: true,
        PlaylistItems: buildPlaylistQueryBody(pagination),
      },
    });

    return paginate({
      data: result?.PlaylistItems || [],
      count: result?.itemsCount || 0,
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

  async addToPlaylist(playlist: string, videoId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.playlistItem.create({
        data: { playlistId: playlist, videoId },
      });
      await tx.playlist.update({
        where: { id: playlist },
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
      await tx.playlist.update({
        where: { id: playlistId },
        data: { itemsCount: { decrement: 1 } },
      });
    });
  }
}
