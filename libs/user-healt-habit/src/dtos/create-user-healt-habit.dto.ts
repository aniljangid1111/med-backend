import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateUserHealthHabitDto {
  @IsNumber()
  @IsNotEmpty()
  healthHabitId: number;

  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;
}
