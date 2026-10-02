import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateHealthGoalDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    name: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    description: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    status: string;
}
