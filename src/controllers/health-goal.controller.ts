import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe,
    Query,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common';
import { CurrentUser } from '@auth/auth/decorator/current-user.decorator';
import { User } from '@user/user/enitity/user.entity';
import {
    HealthGoalService,
    AddUserHealthGoalDto,
    AddMultipleUserHealthGoalsDto,
} from '@app/health-goal';

@Controller('health-goals')
export class HealthGoalController {
    constructor(private readonly healthGoalService: HealthGoalService) { }

    /**
     * Get all available health goals
     * @param limit - Maximum number of results to return (default: 10)
     * @param search - Search term to filter health goals by name or description
     * @returns List of all health goals
     */
    @Get()
    async getAllHealthGoals(
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('search') search?: string,
    ) {
        return this.healthGoalService.getAllHealthGoals(search, limit);
    }

    /**
     * Get current user's health goals
     * @param user - Current authenticated user
     * @returns List of user's health goals
     */
    @Get('my-health-goals')
    async getMyHealthGoals(@CurrentUser() user: User) {
        return this.healthGoalService.getUserHealthGoals(user.id);
    }

    /**
     * Add a health goal to current user
     * Can provide either an existing healthGoalId or a new healthGoalName
     * @param user - Current authenticated user
     * @param addDto - DTO containing healthGoalId or healthGoalName
     * @returns Created user health goal
     */
    @Post('my-health-goals')
    @HttpCode(HttpStatus.CREATED)
    async addMyHealthGoal(
        @CurrentUser() user: User,
        @Body() addDto: AddUserHealthGoalDto,
    ) {
        return this.healthGoalService.addUserHealthGoal(user.id, addDto);
    }

    /**
     * Add multiple health goals to current user in a single request
     * Each item can provide either an existing healthGoalId or a new healthGoalName
     * @param user - Current authenticated user
     * @param addMultipleDto - DTO containing array of health goals
     * @returns Object with success count, failed count, and created health goals
     */
    @Post('my-health-goals/bulk')
    @HttpCode(HttpStatus.CREATED)
    async addMultipleHealthGoals(
        @CurrentUser() user: User,
        @Body() addMultipleDto: AddMultipleUserHealthGoalsDto,
    ) {
        return this.healthGoalService.addMultipleUserHealthGoals(
            user.id,
            addMultipleDto,
        );
    }

    /**
     * Remove a health goal from current user by health goal ID
     * @param user - Current authenticated user
     * @param healthGoalId - ID of the health goal to remove
     * @returns Success message
     */
    @Delete('my-health-goals/:healthGoalId')
    @HttpCode(HttpStatus.OK)
    async removeMyHealthGoal(
        @CurrentUser() user: User,
        @Param('healthGoalId', ParseUUIDPipe) healthGoalId: string,
    ) {
        return this.healthGoalService.removeUserHealthGoal(user.id, healthGoalId);
    }

    /**
     * Remove a user health goal by its record ID
     * @param userHealthGoalId - ID of the user health goal record to remove
     * @returns Success message
     */
    @Delete('my-health-goals/record/:userHealthGoalId')
    @HttpCode(HttpStatus.OK)
    async removeMyHealthGoalById(
        @Param('userHealthGoalId', ParseUUIDPipe) userHealthGoalId: string,
    ) {
        return this.healthGoalService.removeUserHealthGoalById(userHealthGoalId);
    }
}
