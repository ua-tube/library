import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { LibraryService } from '../library.service';
import { AuthUserGuard } from '../../common/guards';
import { UserId } from '../../common/decorators';
import {
  AddToPlaylistDto,
  GetPlaylistDto,
  PaginationDto,
  RemoveFromPlaylistDto,
} from '../dto';

@UseGuards(AuthUserGuard)
@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get('playlists')
  getPlaylist(
    @Query() query: GetPlaylistDto,
    @Query() pagination: PaginationDto,
    @UserId() userId: string,
  ) {
    switch (query.t.toUpperCase()) {
      case 'LL':
        return this.libraryService.getLikedPlaylist(userId, pagination);
      case 'DL':
        return this.libraryService.getDislikedPlaylist(userId, pagination);
      case 'WL':
        return this.libraryService.getWatchLaterPlaylist(userId, pagination);
    }

    return this.libraryService.getPlaylist(query.t, pagination);
  }

  @Post('playlists/add-item')
  addToPlaylist(@Body() dto: AddToPlaylistDto, @UserId() userId: string) {
    switch (dto.t.toUpperCase()) {
      case 'LL':
        return this.libraryService.addToLikedPlaylist(userId, dto.videoId);
      case 'DL':
        return this.libraryService.addToDislikedPlaylist(userId, dto.videoId);
      case 'WL':
        return this.libraryService.addToWatchLaterPlaylist(userId, dto.videoId);
    }

    return this.libraryService.addToPlaylist(dto.t, dto.videoId);
  }

  @Post('playlists/remove-item')
  removeFromPlaylist(
    @Body() dto: RemoveFromPlaylistDto,
    @UserId() userId: string,
  ) {
    switch (dto.t.toUpperCase()) {
      case 'LL':
        return this.libraryService.removeFromLikedPlaylist(userId, dto.videoId);
      case 'DL':
        return this.libraryService.removeFromDislikedPlaylist(
          userId,
          dto.videoId,
        );
      case 'WL':
        return this.libraryService.removeFromWatchLaterPlaylist(
          userId,
          dto.videoId,
        );
    }

    return this.libraryService.removeFromPlaylist(dto.t, dto.videoId);
  }
}
