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
  AllergiesService,
  AddUserAllergyDto,
  AddMultipleUserAllergiesDto,
} from '@app/allergies';

@Controller('allergies')
export class AllergiesController {
  constructor(private readonly allergiesService: AllergiesService) {}

  /**
   * Get all available allergies
   * @param limit - Maximum number of results to return (default: 50)
   * @param search - Search term to filter allergies by name
   * @returns List of all active allergies
   */
  @Get()
  async getAllAllergies(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.allergiesService.getAllAllergies(true, limit, search);
  }

  /**
   * Get current user's allergies
   * @param user - Current authenticated user
   * @returns List of user's allergies
   */
  @Get('my-allergies')
  async getMyAllergies(@CurrentUser() user: User) {
    return this.allergiesService.getUserAllergies(user.id);
  }

  /**
   * Add an allergy to current user
   * Can provide either an existing allergyId or a new allergyName
   * @param user - Current authenticated user
   * @param addDto - DTO containing allergyId or allergyName
   * @returns Created user allergy
   */
  @Post('my-allergies')
  @HttpCode(HttpStatus.CREATED)
  async addMyAllergy(
    @CurrentUser() user: User,
    @Body() addDto: AddUserAllergyDto,
  ) {
    return this.allergiesService.addUserAllergy(user.id, addDto);
  }

  /**
   * Add multiple allergies to current user in a single request
   * Each item can provide either an existing allergyId or a new allergyName
   * @param user - Current authenticated user
   * @param addMultipleDto - DTO containing array of allergies
   * @returns Object with success count, failed count, and created allergies
   */
  @Post('my-allergies/bulk')
  @HttpCode(HttpStatus.CREATED)
  async addMultipleAllergies(
    @CurrentUser() user: User,
    @Body() addMultipleDto: AddMultipleUserAllergiesDto,
  ) {
    return this.allergiesService.addMultipleUserAllergies(
      user.id,
      addMultipleDto,
    );
  }

  /**
   * Remove an allergy from current user by allergy ID
   * @param user - Current authenticated user
   * @param allergyId - ID of the allergy to remove
   * @returns Success message
   */
  @Delete('my-allergies/:allergyId')
  @HttpCode(HttpStatus.OK)
  async removeMyAllergy(
    @CurrentUser() user: User,
    @Param('allergyId', ParseUUIDPipe) allergyId: string,
  ) {
    return this.allergiesService.removeUserAllergy(user.id, allergyId);
  }

  /**
   * Remove a user allergy by its record ID
   * @param userAllergyId - ID of the user allergy record to remove
   * @returns Success message
   */
  @Delete('my-allergies/record/:userAllergyId')
  @HttpCode(HttpStatus.OK)
  async removeMyAllergyById(
    @Param('userAllergyId', ParseUUIDPipe) userAllergyId: string,
  ) {
    return this.allergiesService.removeUserAllergyById(userAllergyId);
  }
}
