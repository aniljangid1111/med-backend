import {
  IsArray,
  IsString,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class HealthConditionItemDto {
  @IsUUID()
  @IsString()
  healthConditionId?: string;

  @IsString()
  healthConditionName?: string;
}

export class AddMultipleUserHealthConditionsDto {
  @IsArray()
  @ArrayMinSize(1, {
    message: 'At least one health condition must be provided',
  })
  @ValidateNested({ each: true })
  @Type(() => HealthConditionItemDto)
  healthConditions: HealthConditionItemDto[];
}
