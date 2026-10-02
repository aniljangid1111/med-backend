import {
  IsUUID,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsString,
} from 'class-validator';
import { DoseTimeOfDay } from '../entity/medication-logs.entity';

export class CreateMedicationLogDto {
  @IsDateString()
  logDate: string; // YYYY-MM-DD or ISO

  @IsDateString()
  timeTaken: string; // ISO timestamp

  @IsEnum(DoseTimeOfDay)
  doseTimeOfDay: DoseTimeOfDay;

  @IsNumber()
  dosageTaken: number;

  @IsOptional()
  @IsBoolean()
  wasTaken?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
