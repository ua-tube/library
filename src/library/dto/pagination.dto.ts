import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => +value)
  page: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(10)
  @Max(50)
  @Transform(({ value }) => +value)
  perPage: number;
}
