import { CanBeUndefined } from '../../common/decorators';
import { IsIn } from 'class-validator';

export class SortVideosDto {
  @CanBeUndefined()
  @IsIn(['createdAt', 'viewsCount', 'likesCount'])
  sortBy?: 'createdAt' | 'viewsCount' | 'likesCount';

  @CanBeUndefined()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
