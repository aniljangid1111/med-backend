import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { HealthHabitsEnum } from '../enums/healts-habits.enum';

export enum TestComponentResultType {
  QUANTITATIVE = 'QUANTITATIVE',
  QUALITATIVE = 'QUALITATIVE',
  TEXTUAL = 'TEXTUAL',
  CALCULATED = 'CALCULATED',
}

export class CreateLabUnitReferenceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  unit!: string;

  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  normalRangeMin?: number | null;

  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  normalRangeMax?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  conversionFactor?: string | null;
}

export class CreateTestComponentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  componentName!: string;

  @IsOptional()
  @IsEnum(TestComponentResultType)
  resultType?: TestComponentResultType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  calculationFormula?: string | null;

  @IsString()
  @IsNotEmpty()
  normalRangeText!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  contextFactors?: string | null;

  @IsNumber()
  labTestId!: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLabUnitReferenceDto)
  unitReferences?: CreateLabUnitReferenceDto[];
}

export class CreateHealthHabitDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name!: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  description?: string | null;

  @IsOptional()
  @IsString()
  icon?: string | null;

  @IsOptional()
  @IsString()
  bgImage?: string | null;

  @IsOptional()
  @IsString()
  color?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsEnum(HealthHabitsEnum)
  type!: HealthHabitsEnum;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTestComponentDto)
  components?: CreateTestComponentDto[];
}
