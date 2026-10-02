import { IsString, IsUUID, IsOptional, ValidateIf } from 'class-validator';

export class AddUserHealthConditionDto {
  @ValidateIf((o: AddUserHealthConditionDto) => !o.healthConditionName)
  @IsUUID()
  @IsOptional()
  healthConditionId?: string;

  @ValidateIf((o: AddUserHealthConditionDto) => !o.healthConditionId)
  @IsString()
  @IsOptional()
  healthConditionName?: string;
}
