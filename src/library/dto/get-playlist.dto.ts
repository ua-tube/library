import { IsNotEmpty, IsString } from 'class-validator';

export class GetPlaylistDto {
  @IsNotEmpty()
  @IsString()
  t: string;
}
