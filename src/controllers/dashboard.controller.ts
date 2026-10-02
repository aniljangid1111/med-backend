import { CurrentUser } from '@auth/auth/decorator/current-user.decorator';
import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { UserHealtHabitService } from '@user-healt-habit/user-healt-habit';
import { User } from '@user/user/enitity/user.entity';
import { isISO8601 } from 'class-validator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly userHealthHabitService: UserHealtHabitService) {}

  @Get('stats')
  async getStats(
    @CurrentUser() user: User,
    @Query('date') date?: string,
  ): Promise<{
    total_healths: number;
    total_habits: number;
    total_filled_healths: number;
    total_filled_habits: number;
    date: string;
  }> {
    // Use provided date or default to today
    let queryDate: Date;

    if (date) {
      // Validate the date format
      if (!isISO8601(date)) {
        throw new BadRequestException(
          'Invalid date format. Please use ISO 8601 format (e.g., 2024-10-04 or 2024-10-04T00:00:00Z).',
        );
      }
      queryDate = new Date(date);
    } else {
      queryDate = new Date();
    }

    // Validate that the date is valid
    if (isNaN(queryDate.getTime())) {
      throw new BadRequestException('Invalid date provided.');
    }

    const stats =
      await this.userHealthHabitService.getUserHealthHabitStatsByDate(
        user.id,
        queryDate,
      );

    return {
      ...stats,
      date: queryDate.toISOString().split('T')[0], // Return date in YYYY-MM-DD format
    };
  }

  @Get('health-habits')
  async getHealthHabitsWithData(
    @CurrentUser() user: User,
    @Query('date') date?: string,
  ) {
    // Use provided date or default to today
    let queryDate: Date;

    if (date) {
      // Validate the date format
      if (!isISO8601(date)) {
        throw new BadRequestException(
          'Invalid date format. Please use ISO 8601 format (e.g., 2024-10-04 or 2024-10-04T00:00:00Z).',
        );
      }
      queryDate = new Date(date);
    } else {
      queryDate = new Date();
    }

    // Validate that the date is valid
    if (isNaN(queryDate.getTime())) {
      throw new BadRequestException('Invalid date provided.');
    }

    const result =
      await this.userHealthHabitService.getUserFavoriteHealthHabitsWithData(
        user.id,
        queryDate,
      );

    return {
      date: queryDate.toISOString().split('T')[0],
      healths: result.healths,
      habits: result.habits,
    };
  }
}
