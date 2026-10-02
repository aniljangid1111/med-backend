import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddUserHealthGoalDto } from './add-user-health-goal.dto';

export class AddMultipleUserHealthGoalsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AddUserHealthGoalDto)
    healthGoals: AddUserHealthGoalDto[];
}
