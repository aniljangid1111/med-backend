import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { Gender } from '../enums/gender.enum';
import { BloodGroup } from '../enums/blood-group.enum';

export class UpdateUserInfoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(Gender)
  gender: string;

  @IsString()
  @IsDateString()
  dateOfBirth: string;

  @IsOptional()
  @ValidateIf((o) => !!o.bloodGroup)
  @IsEnum(BloodGroup, {
    message: `bloodGroup must be one of: ${Object.values(BloodGroup).join(', ')}`,
  })
  bloodGroup?: BloodGroup;

  @IsNumber()
  @Min(0)
  height: number;

  @IsNumber()
  @Min(0)
  weight: number;

  @IsString()
  @IsNotEmpty()
  alertTime: string;
}
