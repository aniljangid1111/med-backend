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
  HealthConditionService,
  AddUserHealthConditionDto,
  AddMultipleUserHealthConditionsDto,
} from '@app/health-condition';

@Controller('health-conditions')
export class HealthConditionsController {
  constructor(
    private readonly healthConditionService: HealthConditionService,
  ) {}

  /**
   * Get all available health conditions
   * @param limit - Maximum number of results to return (default: 50)
   * @param search - Search term to filter health conditions by name
   * @returns List of all active health conditions
   */
  @Get()
  async getAllHealthConditions(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.healthConditionService.getAllHealthConditions(
      true,
      limit,
      search,
    );
  }

  /**
   * Get current user's health conditions
   * @param user - Current authenticated user
   * @returns List of user's health conditions
   */
  @Get('my-conditions')
  async getMyHealthConditions(@CurrentUser() user: User) {
    return this.healthConditionService.getUserHealthConditions(user.id);
  }

  /**
   * Add a health condition to current user
   * Can provide either an existing healthConditionId or a new healthConditionName
   * @param user - Current authenticated user
   * @param addDto - DTO containing healthConditionId or healthConditionName
   * @returns Created user health condition
   */
  @Post('my-conditions')
  @HttpCode(HttpStatus.CREATED)
  async addMyHealthCondition(
    @CurrentUser() user: User,
    @Body() addDto: AddUserHealthConditionDto,
  ) {
    return this.healthConditionService.addUserHealthCondition(user.id, addDto);
  }

  /**
   * Add multiple health conditions to current user in a single request
   * Each item can provide either an existing healthConditionId or a new healthConditionName
   * @param user - Current authenticated user
   * @param addMultipleDto - DTO containing array of health conditions
   * @returns Object with success count, failed count, and created health conditions
   */
  @Post('my-conditions/bulk')
  @HttpCode(HttpStatus.CREATED)
  async addMultipleHealthConditions(
    @CurrentUser() user: User,
    @Body() addMultipleDto: AddMultipleUserHealthConditionsDto,
  ) {
    return this.healthConditionService.addMultipleUserHealthConditions(
      user.id,
      addMultipleDto,
    );
  }

  /**
   * Remove a health condition from current user by health condition ID
   * @param user - Current authenticated user
   * @param healthConditionId - ID of the health condition to remove
   * @returns Success message
   */
  @Delete('my-conditions/:healthConditionId')
  @HttpCode(HttpStatus.OK)
  async removeMyHealthCondition(
    @CurrentUser() user: User,
    @Param('healthConditionId', ParseUUIDPipe) healthConditionId: string,
  ) {
    return this.healthConditionService.removeUserHealthCondition(
      user.id,
      healthConditionId,
    );
  }

  /**
   * Remove a user health condition by its record ID
   * @param user - Current authenticated user
   * @param userHealthConditionId - ID of the user health condition record to remove
   * @returns Success message
   */
  @Delete('my-conditions/record/:userHealthConditionId')
  @HttpCode(HttpStatus.OK)
  async removeMyHealthConditionById(
    @Param('userHealthConditionId', ParseUUIDPipe)
    userHealthConditionId: string,
  ) {
    return this.healthConditionService.removeUserHealthConditionById(
      userHealthConditionId,
    );
  }
}
