import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateMedicineDto {
  @IsString()
  brandName: string;

  @IsString()
  genericName: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  activeIngredients?: string[];

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  dosageForm?: string;

  @IsOptional()
  @IsString()
  strength?: string;

  @IsOptional()
  @IsString()
  drugClass?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPrescriptionRequired?: boolean;
}
