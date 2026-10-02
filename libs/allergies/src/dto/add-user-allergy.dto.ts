import { IsString, IsUUID, IsOptional, ValidateIf } from 'class-validator';

export class AddUserAllergyDto {
  @ValidateIf((o: AddUserAllergyDto) => !o.allergyName)
  @IsUUID()
  @IsOptional()
  allergyId?: string;

  @ValidateIf((o: AddUserAllergyDto) => !o.allergyId)
  @IsString()
  @IsOptional()
  allergyName?: string;
}
