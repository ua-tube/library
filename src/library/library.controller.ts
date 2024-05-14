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

  @Post('playlists')
  createPlaylist(@Body() dto: CreatePlaylistDto, @UserId() userId: string) {
    return this.libraryService.createPlaylist(dto, userId);
  }

  @Patch('playlists/:playlistId')
  updatePlaylist(
    @Param('playlistId', ParseUUIDPipe) playlistId: string,
    @Body() dto: UpdatePlaylistDto,
  ) {
    return this.libraryService.updatePlaylist(playlistId, dto);
  }

  @Delete('playlists/:playlistId')
  deletePlaylist(@Param('playlistId', ParseUUIDPipe) playlistId: string) {
    return this.libraryService.deletePlaylist(playlistId);
  }

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

    return this.libraryService.addToPlaylist(dto.t, dto.videoId);
  }

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

    return this.libraryService.removeFromPlaylist(dto.t, dto.videoId);
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
