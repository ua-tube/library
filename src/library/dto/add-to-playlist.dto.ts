import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AddToPlaylistDto {
  @IsNotEmpty()
  @IsString()
  t: string;

  @IsNotEmpty()
  @IsUUID('4')
  videoId: string;
}
