import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  IsDateString,
  IsBoolean,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  MedicationFrequency,
  MedicationDosageType,
  MedicationDurationUnit,
  MedicationInstruction,
} from '../entity/user-medication.enity';

export class CreateUserMedicationDto {
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

  @IsInt()
  @Type(() => Number)
  durationValue: number;

  @IsEnum(MedicationDurationUnit)
  durationUnit: MedicationDurationUnit;

  @IsEnum(MedicationInstruction)
  instruction: MedicationInstruction;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.instruction === MedicationInstruction.CUSTOM)
  customInstruction?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
