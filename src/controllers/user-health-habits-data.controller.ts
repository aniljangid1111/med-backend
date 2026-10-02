import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ParseIntPipe,
  DefaultValuePipe,
  Delete,
  Put,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { CurrentUser } from '@auth/auth/decorator/current-user.decorator';
import { User } from '@user/user/enitity/user.entity';
import {
  UserHealtHabitService,
  CreateUserHealthHabitDto,
} from '@user-healt-habit/user-healt-habit';
import {
  UserHealtHabitDataService,
  CreateUserHealthHabitDataDto,
  UserHealtHabitReportService,
} from '@user-healt-habit-data/user-healt-habit-data';
import {
  HealthHabitService,
  CreateCustomHealthHabitDto,
  UpdateCustomHealthHabitDto,
} from '@healthheabit/health-habit';

@Controller('user-health-habits')
export class UserHealthHabitsDataController {
  constructor(
    private readonly userHealthHabitService: UserHealtHabitService,
    private readonly userHealthHabitDataService: UserHealtHabitDataService,
    private readonly userHealthHabitReportService: UserHealtHabitReportService,
    private readonly healthHabitService: HealthHabitService,
  ) {
    //
  }

  /**
   * List all available health habits with pagination, search, and type filter
   * Filters by system habits + custom habits belonging to the current user
   * @param user - Current authenticated user
   * @param page - Page number (default: 1)
   * @param limit - Number of items per page (default: 10)
   * @param search - Search term to filter by name, description, or component name
   * @param type - Filter by habit type ('health' or 'habit')
   * @returns Paginated list of health habits with metadata
   */
  @Get('habits/list')
  async listAllHealthHabits(
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('type') type?: 'health' | 'habit',
  ) {
    // Validate pagination parameters
    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    // Validate type parameter if provided
    if (type && !['health', 'habit'].includes(type)) {
      throw new BadRequestException('Type must be either "health" or "habit"');
    }

    return this.healthHabitService.findAllPaginated({
      search,
      type,
      userId: user?.id,
      page,
      limit,
    });
  }

  /**
   * Create a custom health habit with custom components and automatically link to current user
   * @param user - Current authenticated user
   * @param dto - Custom habit details (name, type, fields, etc.)
   * @returns Created habit and user health habit
   */
  @Post('custom')
  @HttpCode(HttpStatus.CREATED)
  async createCustomHealthHabit(
    @CurrentUser() user: User,
    @Body() dto: CreateCustomHealthHabitDto,
  ) {
    if (!dto.fields || dto.fields.length === 0) {
      throw new BadRequestException('At least one field is required');
    }

    const habit = await this.healthHabitService.createCustomHealthHabit(
      dto,
      user.id,
    );

    const userHabit = await this.userHealthHabitService.createUserHealthHabit(
      { healthHabitId: habit.id, isFavorite: false },
      user,
    );

    return {
      habit,
      userHabit,
    };
  }

  /**
   * Update an existing custom health habit definition (name, description, color, components, units)
   * @param id - Habit ID (numeric or userHabit UUID)
   * @param user - Current authenticated user
   * @param dto - Updated fields and habit details
   */
  @Put('custom/:id')
  async updateCustomHealthHabit(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateCustomHealthHabitDto,
  ) {
    let habitId: number;
    if (isNaN(Number(id))) {
      const userHabit =
        await this.userHealthHabitService.findUserHealthHabitById(id);
      if (userHabit.userId !== user.id) {
        throw new BadRequestException('This health habit does not belong to you');
      }
      habitId = Number(userHabit.healthHabitId);
    } else {
      habitId = Number(id);
    }

    return this.healthHabitService.updateCustomHealthHabit(
      habitId,
      user.id,
      dto,
    );
  }

  @Patch('custom/:id')
  async patchCustomHealthHabit(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateCustomHealthHabitDto,
  ) {
    return this.updateCustomHealthHabit(id, user, dto);
  }

  @Put(":id/favorite")
  async toggleFavoriteHealthHabit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return await this.userHealthHabitService.toggleFavoriteHealthHabit(id, user.id);
  }

  /**
   * Get all health habits for the current user
   * @param user - Current authenticated user
   * @returns List of user's health habits with related health habit info
   */
  @Get()
  async getUserHealthHabits(@CurrentUser() user: User) {
    return this.userHealthHabitService.findUserHealthHabitsByUserId(user.id);
  }

  /**
   * Get user's favorite health habits
   * @param user - Current authenticated user
   * @param date - Optional date to filter by (ISO 8601 format)
   * @returns List of user's favorite health habits
   */
  @Get('favorites')
  async getUserFavoriteHealthHabits(
    @CurrentUser() user: User,
    @Query('date') date?: string,
  ) {
    const filterDate = date ? new Date(date) : new Date();
    return this.userHealthHabitService.findUserFavoriteHealthHabitsByUserId(
      user.id,
      filterDate,
    );
  }

  /**
   * Get a specific user health habit by ID
   * @param id - User health habit UUID
   * @param user - Current authenticated user
   * @returns User health habit details
   */
  @Get(':id')
  async getUserHealthHabitById(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    let healthHabit: any;
    if (!isNaN(Number(id))) {
      const userHabits =
        await this.userHealthHabitService.findUserHealthHabitsByHealthHabitId(id);
      const mine = userHabits.find((u) => u.userId === user.id);
      if (!mine) {
        throw new NotFoundException('Health habit not found in your list');
      }
      healthHabit = await this.userHealthHabitService.findUserHealthHabitById(
        mine.id,
      );
    } else {
      healthHabit =
        await this.userHealthHabitService.findUserHealthHabitById(id);
    }

    // Ensure the health habit belongs to the current user
    if (healthHabit.userId !== user.id) {
      throw new BadRequestException('This health habit does not belong to you');
    }

    return healthHabit;
  }

  /**
   * Get user's health habit data history
   * @param user - Current authenticated user
   * @param date - Optional date to filter by (ISO 8601 format: YYYY-MM-DD)
   * @returns List of user's health habit data entries
   */
  @Get('data/history')
  async getUserHealthHabitDataHistory(
    @CurrentUser() user: User,
    @Query('date') date?: string,
  ) {
    if (date) {
      // Filter by specific date
      const filterDate = new Date(date);
      if (isNaN(filterDate.getTime())) {
        throw new BadRequestException(
          'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)',
        );
      }
      return this.userHealthHabitDataService.findByUserIdAndDate(
        user.id,
        filterDate,
      );
    }

    // Return all user's health habit data
    const allData =
      await this.userHealthHabitDataService.findAllUserHealthHabitData();
    return allData.filter((data) => data.userId === user.id);
  }

  /**
   * Get user's favorite health habit data
   * @param user - Current authenticated user
   * @returns List of user's favorite health habit data entries
   */
  @Get('data/favorites')
  async getUserFavoriteHealthHabitData(@CurrentUser() user: User) {
    return this.userHealthHabitDataService.findHealthHabitByUserFavorite(
      user.id,
    );
  }

  /**
   * Get paginated health habit data for a specific health habit
   * @param healthHabitId - Health habit ID to filter by
   * @param user - Current authenticated user
   * @param page - Page number (default: 1)
   * @param limit - Number of items per page (default: 10)
   * @returns Paginated list of health habit data entries
   */
  @Get('data/by-habit/:healthHabitId')
  async getHealthHabitDataByHealthHabitId(
    @Param('healthHabitId', ParseIntPipe) healthHabitId: number,
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    // Validate pagination parameters
    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }

    return this.userHealthHabitDataService.findUserHealthHabitDataByHealthHabitId(
      user.id,
      healthHabitId,
      page,
      limit,
    );
  }

  /**
   * Get specific health habit data entry by ID
   * @param id - Health habit data UUID
   * @param user - Current authenticated user
   * @returns Health habit data details
   */
  @Get('data/:id')
  async getHealthHabitDataById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const data =
      await this.userHealthHabitDataService.findUserHealthHabitDataById(id);

    // Ensure the data belongs to the current user
    if (data.userId !== user.id) {
      throw new BadRequestException(
        'This health habit data does not belong to you',
      );
    }

    return data;
  }

  /**
   * Add a health habit to user's health habit list
   * @param user - Current authenticated user
   * @param createDto - Health habit to add (healthHabitId and optional isFavorite)
   * @returns Created user health habit entry
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addUserHealthHabit(
    @CurrentUser() user: User,
    @Body() createDto: CreateUserHealthHabitDto,
  ) {
    return this.userHealthHabitService.createUserHealthHabit(createDto, user);
  }

  /**
   * Remove a health habit from user's health habit list
   * @param id - User health habit UUID
   * @param user - Current authenticated user
   * @returns Success message
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async removeUserHealthHabit(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    let habitNumericId: number | null = null;
    let userHabitId: string | null = null;

    if (!isNaN(Number(id))) {
      habitNumericId = Number(id);
      try {
        const userHabits =
          await this.userHealthHabitService.findUserHealthHabitsByHealthHabitId(
            id,
          );
        const mine = userHabits.find((u) => u.userId === user.id);
        if (mine) {
          userHabitId = mine.id;
        }
      } catch {}
    } else {
      userHabitId = id;
      try {
        const uh =
          await this.userHealthHabitService.findUserHealthHabitById(id);
        if (uh) {
          habitNumericId = Number(uh.healthHabitId);
        }
      } catch {}
    }

    // 1. Delete userHealthHabit link if exists
    if (userHabitId) {
      try {
        await this.userHealthHabitService.deleteUserHealthHabit(userHabitId);
      } catch {}
    }

    // 2. Delete any reading data and custom habit definition
    if (habitNumericId) {
      try {
        await this.userHealthHabitDataService.deleteByHealthHabitId(
          habitNumericId,
          user.id,
        );
      } catch {}

      try {
        await this.healthHabitService.deleteCustomHealthHabit(
          habitNumericId,
          user.id,
        );
      } catch {}
    }

    return { success: true, message: 'Deleted successfully' };
  }

  @Delete('data/:id')
  @HttpCode(HttpStatus.OK)
  async deleteHealthHabitData(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const data =
      await this.userHealthHabitDataService.findUserHealthHabitDataById(id);

    if (data.userId !== user.id) {
      throw new BadRequestException(
        'This health habit data does not belong to you',
      );
    }

    await this.userHealthHabitDataService.deleteUserHealthHabitData(id);
    return { success: true, message: 'Reading deleted successfully' };
  }

  /**
   * Create/fill new health habit data entry
   * @param user - Current authenticated user
   * @param createDto - Health habit data to create
   * @returns Created health habit data entry
   */
  @Post('data')
  @HttpCode(HttpStatus.CREATED)
  async createHealthHabitData(
    @CurrentUser() user: User,
    @Body() createDto: CreateUserHealthHabitDataDto,
  ) {
    const dataToCreate = {
      ...createDto,
      userId: user.id,
    };

    return this.userHealthHabitDataService.createUserHealthHabitData(
      dataToCreate,
    );
  }

  /**
   * Update an existing health habit data entry by its UUID.
   * All fields are optional — only provided fields will be updated.
   * @param id - Health habit data UUID
   * @param user - Current authenticated user
   * @param updateDto - Fields to update (all optional)
   * @returns Updated health habit data entry
   */
  @Put('data/:id')
  async updateHealthHabitData(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() updateDto: Partial<CreateUserHealthHabitDataDto>,
  ) {
    const data =
      await this.userHealthHabitDataService.findUserHealthHabitDataById(id);

    if (data.userId !== user.id) {
      throw new BadRequestException(
        'This health habit data does not belong to you',
      );
    }

    return this.userHealthHabitDataService.updateUserHealthHabitData(
      id,
      updateDto,
    );
  }


  /**
   * Get user health habit statistics for a specific date
   * @param user - Current authenticated user
   * @param date - Date to get statistics for (ISO 8601 format: YYYY-MM-DD)
   * @returns Statistics for the specified date
   */
  @Get('stats/by-date')
  async getUserHealthHabitStats(
    @CurrentUser() user: User,
    @Query('date') date?: string,
  ) {
    const filterDate = date ? new Date(date) : new Date();
    if (isNaN(filterDate.getTime())) {
      throw new BadRequestException(
        'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)',
      );
    }

    return this.userHealthHabitService.getUserHealthHabitStatsByDate(
      user.id,
      filterDate,
    );
  }

  /**
   * Get line chart data for a specific health habit
   * @param healthHabitId - Health habit ID (UUID)
   * @param user - Current authenticated user
   * @param period - Time period ('weekly', 'monthly', 'quarterly')
   * @returns Chart data grouped by component
   */
  @Get('data/chart/:healthHabitId')
  async getHealthHabitChartData(
    @Param('healthHabitId', ParseIntPipe) healthHabitId: number,
    @CurrentUser() user: User,
    @Query('period') period?: 'weekly' | 'monthly' | 'quarterly' | 'custom',
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    if (
      period &&
      !['weekly', 'monthly', 'quarterly', 'custom'].includes(period)
    ) {
      throw new BadRequestException(
        'Period must be one of: weekly, monthly, quarterly, custom',
      );
    }

    if (period === 'custom' && (!from || !to)) {
      throw new BadRequestException(
        'When period is "custom", both "from" and "to" date parameters are required',
      );
    }

    if (from && isNaN(new Date(from).getTime())) {
      throw new BadRequestException(
        'Invalid "from" date format. Use ISO 8601 format (YYYY-MM-DD)',
      );
    }
    if (to && isNaN(new Date(to).getTime())) {
      throw new BadRequestException(
        'Invalid "to" date format. Use ISO 8601 format (YYYY-MM-DD)',
      );
    }

    const selectedPeriod = period || 'weekly';

    return this.userHealthHabitReportService.getLineChartData(
      user.id,
      healthHabitId,
      selectedPeriod,
      from,
      to,
    );
  }
}
