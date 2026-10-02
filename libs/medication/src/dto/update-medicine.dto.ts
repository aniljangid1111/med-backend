import { IsOptional, IsString, IsArray, IsBoolean } from 'class-validator';

export class UpdateMedicineDto {
  @IsOptional()
  @IsString()
  brandName?: string;

  @IsOptional()
  @IsString()
  genericName?: string;

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
