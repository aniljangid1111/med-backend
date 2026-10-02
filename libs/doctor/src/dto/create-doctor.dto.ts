import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';

export class CreateDoctorDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  doctorName: string;

  @IsString()
  @IsOptional()
  speciality?: string;

  @IsString()
  @IsOptional()
  mobileNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsInt()
  @IsOptional()
  numberOfVisits?: number;

  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @IsBoolean()
  @IsOptional()
  remindInWeek?: boolean;

  @IsBoolean()
  @IsOptional()
  isFamilyDoctor?: boolean;
}
