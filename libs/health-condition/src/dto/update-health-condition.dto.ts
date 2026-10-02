import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateHealthConditionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
