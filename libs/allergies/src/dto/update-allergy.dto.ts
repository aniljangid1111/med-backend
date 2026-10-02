import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateAllergyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  allergenType?: string;

  @IsString()
  @IsOptional()
  commonSymptoms?: string;

  @IsString()
  @IsOptional()
  severity?: string;

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
