import { IsOptional, IsString } from 'class-validator';

export class MedicationLogsQueryDto {
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;
}
