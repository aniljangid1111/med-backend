import {
  IsArray,
  IsString,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AllergyItemDto {
  @IsUUID()
  @IsString()
  allergyId?: string;

  @IsString()
  allergyName?: string;
}

export class AddMultipleUserAllergiesDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one allergy must be provided' })
  @ValidateNested({ each: true })
  @Type(() => AllergyItemDto)
  allergies: AllergyItemDto[];
}
