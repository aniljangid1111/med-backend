import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateUserHealthHabitDataDto {
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  healthHabitId!: number;

  @IsUUID()
  @IsOptional()
  userId!: string;

  @IsUUID()
  componentDefinitionId!: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsDateString()
  reportedAt?: string;

  @IsString()
  @IsNotEmpty()
  resultValue!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  numericResult?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  unitUsed?: string | null;

  @IsOptional()
  @IsString()
  contextNote?: string | null;
}
