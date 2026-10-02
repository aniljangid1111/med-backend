import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  MedicationFrequency,
  MedicationDosageType,
  MedicationDurationUnit,
  MedicationInstruction,
} from '../entity/user-medication.enity';

export class UpdateUserMedicationDto {
  @IsOptional()
  @IsUUID()
  medicineId?: string;

  @IsOptional()
  @IsString()
  medicineName?: string;

  @IsOptional()
  @IsEnum(MedicationFrequency)
  frequency?: MedicationFrequency;

  @IsOptional()
  @IsEnum(MedicationDosageType)
  dosageType?: MedicationDosageType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  morningDosage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  afternoonDosage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  eveningDosage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  nightDosage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  durationValue?: number;

  @IsOptional()
  @IsEnum(MedicationDurationUnit)
  durationUnit?: MedicationDurationUnit;

  @IsOptional()
  @IsEnum(MedicationInstruction)
  instruction?: MedicationInstruction;

  @IsOptional()
  @IsString()
  customInstruction?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
