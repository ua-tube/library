import { IsIn, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class VoteDto {
  @IsNotEmpty()
  @IsUUID(4)
  videoId: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['Like', 'Dislike', 'None'])
  voteType: string;
}
