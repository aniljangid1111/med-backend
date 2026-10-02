import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMedicineDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString({ each: true })
  @IsOptional()
  ingredients?: string[];
}
