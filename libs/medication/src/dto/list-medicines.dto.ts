import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsBooleanString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ListMedicinesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsBooleanString()
  isPrescriptionRequired?: string;

  @IsOptional()
  @IsIn(['createdAt', 'brandName', 'genericName', 'updatedAt'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
