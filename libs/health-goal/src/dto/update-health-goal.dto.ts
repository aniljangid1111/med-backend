import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateHealthGoalDto {
    @IsString()
    @IsOptional()
    @MaxLength(255)
    name?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    description?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    status?: string;
}
