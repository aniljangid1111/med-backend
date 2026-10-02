import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateHealthConditionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
