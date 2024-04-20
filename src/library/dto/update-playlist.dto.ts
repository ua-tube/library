import { IsIn, IsString } from 'class-validator';
import { CanBeNull, CanBeUndefined } from '../../common/decorators';
import { PlaylistVisibility } from '@prisma/client';

export class UpdatePlaylistDto {
  @CanBeUndefined()
  @IsString()
  title?: string;

  @CanBeNull()
  @CanBeUndefined()
  description?: string;

  @CanBeUndefined()
  @IsString()
  @IsIn(Object.keys(PlaylistVisibility))
  visibility?: PlaylistVisibility;
}
