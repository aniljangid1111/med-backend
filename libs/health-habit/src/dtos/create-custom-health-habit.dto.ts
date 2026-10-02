import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { HealthHabitsEnum } from '../enums/healts-habits.enum';

export class CustomFieldDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  unit?: string;
}

export class CreateCustomHealthHabitDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(HealthHabitsEnum)
  type: HealthHabitsEnum;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDto)
  fields: CustomFieldDto[];
}

export class UpdateCustomFieldDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  unit?: string;
}

export class UpdateCustomHealthHabitDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(HealthHabitsEnum)
  type?: HealthHabitsEnum;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCustomFieldDto)
  fields?: UpdateCustomFieldDto[];
}
