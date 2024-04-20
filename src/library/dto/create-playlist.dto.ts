import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { CanBeNull, CanBeUndefined } from '../../common/decorators';
import { PlaylistVisibility } from '@prisma/client';

export class CreatePlaylistDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @CanBeNull()
  @CanBeUndefined()
  description?: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(Object.keys(PlaylistVisibility))
  visibility: PlaylistVisibility;
}
