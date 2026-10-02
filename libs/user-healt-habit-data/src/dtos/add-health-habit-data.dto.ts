import { IsUUID, IsDateString, IsOptional, IsObject } from 'class-validator';

export class AddHealthHabitDataDto {
  @IsUUID()
  healthHabitId: string;

  @IsDateString()
  date: Date;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}
