import { IsOptional, IsString, IsUUID } from 'class-validator';

export class AddUserHealthGoalDto {
    @IsOptional()
    @IsUUID()
    healthGoalId?: string;

    @IsOptional()
    @IsString()
    healthGoalName?: string;
}
