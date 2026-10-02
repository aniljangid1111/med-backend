import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateAllergyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string; // 'food', 'medication', 'environmental', 'insect', 'latex', 'other'

  @IsString()
  @IsOptional()
  allergenType?: string;

  @IsString()
  @IsOptional()
  commonSymptoms?: string;

  @IsString()
  @IsOptional()
  severity?: string; // 'mild', 'moderate', 'severe', 'life-threatening'

  @IsString()
  @IsOptional()
  crossReactivity?: string;

  @IsString()
  @IsOptional()
  avoidanceAdvice?: string;

  @IsBoolean()
  @IsOptional()
  requiresEpiPen?: boolean;

  @IsString()
  @IsOptional()
  emergencyInfo?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
