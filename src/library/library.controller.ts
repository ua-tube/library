import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LibraryService } from './library.service';
import { AuthUserGuard, OptionalAuthUserGuard } from '../common/guards';
import { UserId } from '../common/decorators';
import {
  AddToPlaylistDto,
  CreatePlaylistDto,
  GetPlaylistDto,
  PaginationDto,
  RemoveFromPlaylistDto,
  SortVideosDto,
  UpdatePlaylistDto,
  VoteDto,
} from './dto';

@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @UseGuards(AuthUserGuard)
  @Get('playlists')
  getPlaylist(
    @Query() { t }: GetPlaylistDto,
    @Query() pagination: PaginationDto,
    @UserId() userId: string,
  ) {
    switch (t.toUpperCase()) {
      case 'LL':
        return this.libraryService.getLikedPlaylist(userId, pagination);
      case 'DL':
        return this.libraryService.getDislikedPlaylist(userId, pagination);
      case 'WL':
        return this.libraryService.getWatchLaterPlaylist(userId, pagination);
    }

    return this.libraryService.getPlaylist(t, pagination);
  }

  @UseGuards(AuthUserGuard)
  @Post('playlists')
  createPlaylist(@Body() dto: CreatePlaylistDto, @UserId() userId: string) {
    return this.libraryService.createPlaylist(dto, userId);
  }

  @UseGuards(OptionalAuthUserGuard)
  @Get('playlists/by-creator/:creatorId')
  getCreatorPublicPlaylists(
    @Param('creatorId', ParseUUIDPipe) targetCreatorId: string,
    @UserId() userId?: string,
  ) {
    return this.libraryService.getCreatorPublicPlaylists(
      targetCreatorId,
      userId,
    );
  }

  @UseGuards(AuthUserGuard)
  @Get('playlists/ids-where/:videoId')
  idsWhereVideo(
    @Param('videoId', ParseUUIDPipe) videoId: string,
    @UserId() userId: string,
  ) {
    return this.libraryService.isIn(videoId, userId);
  }

  @UseGuards(AuthUserGuard)
  @Get('playlists/infos/self')
  getPlaylistsInfosBySelf(
    @Query() pagination: PaginationDto,
    @UserId() userId: string,
  ) {
    return this.libraryService.getPlaylistsInfosBySelf(userId, pagination);
  }

  @UseGuards(AuthUserGuard)
  @Patch('playlists/:playlistId')
  updatePlaylist(
    @Param('playlistId', ParseUUIDPipe) playlistId: string,
    @Body() dto: UpdatePlaylistDto,
    @UserId() userId: string,
  ) {
    return this.libraryService.updatePlaylist(playlistId, dto, userId);
  }

  @UseGuards(AuthUserGuard)
  @Delete('playlists/:playlistId')
  deletePlaylist(
    @Param('playlistId', ParseUUIDPipe) playlistId: string,
    @UserId() userId: string,
  ) {
    return this.libraryService.deletePlaylist(playlistId, userId);
  }

  @UseGuards(AuthUserGuard)
  @Post('playlists/add-item')
  addToPlaylist(@Body() dto: AddToPlaylistDto, @UserId() userId: string) {
    switch (dto.t.toUpperCase()) {
      case 'LL':
        return this.libraryService.voteVideo(userId, dto.videoId, 'Like');
      case 'DL':
        return this.libraryService.voteVideo(userId, dto.videoId, 'Dislike');
      case 'WL':
        return this.libraryService.addToWatchLaterPlaylist(userId, dto.videoId);
    }

    return this.libraryService.addToPlaylist(userId, dto.t, dto.videoId);
  }

  @UseGuards(AuthUserGuard)
  @Post('playlists/remove-item')
  removeFromPlaylist(
    @Body() dto: RemoveFromPlaylistDto,
    @UserId() userId: string,
  ) {
    switch (dto.t.toUpperCase()) {
      case 'LL':
      case 'DL':
        return this.libraryService.voteVideo(userId, dto.videoId, 'None');
      case 'WL':
        return this.libraryService.removeFromWatchLaterPlaylist(
          userId,
          dto.videoId,
        );
    }

    return this.libraryService.removeFromPlaylist(userId, dto.t, dto.videoId);
  }

  @UseGuards(OptionalAuthUserGuard)
  @Get('videos/:videoId/metadata')
  getVideoMetadata(
    @Param('videoId', ParseUUIDPipe) videoId: string,
    @UserId() userId?: string,
  ) {
    return this.libraryService.getVideoMetadata(videoId, userId);
  }

  @UseGuards(AuthUserGuard)
  @Post('videos/vote')
  vote(@Body() dto: VoteDto, @UserId() userId: string) {
    return this.libraryService.voteVideo(userId, dto.videoId, dto.voteType);
  }

  @Get('videos/:videoId')
  getVideo(@Param('videoId', ParseUUIDPipe) videoId: string) {
    return this.libraryService.getVideo(videoId);
  }

  @Get('videos/count/:creatorId')
  getVideosCount(@Param('creatorId', ParseUUIDPipe) creatorId: string) {
    return this.libraryService.getVideosCount(creatorId);
  }

  @Get('videos/total-views/:creatorId')
  getVideosTotalViews(@Param('creatorId', ParseUUIDPipe) creatorId: string) {
    return this.libraryService.getVideosTotalViews(creatorId);
  }

  @Get('videos')
  getVideos(
    @Query('creatorId', ParseUUIDPipe) creatorId: string,
    @Query() pagination: PaginationDto,
    @Query() sort: SortVideosDto,
  ) {
    return this.libraryService.getVideos(creatorId, pagination, sort);
  }
}
