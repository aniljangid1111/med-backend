import { CurrentUser } from '@auth/auth/decorator/current-user.decorator';
import { HealthHabitService } from '@healthheabit/health-habit';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import {
  CreateUserHealthHabitDto,
  UserHealtHabitService,
  UserHealthHabit,
} from '@user-healt-habit/user-healt-habit';
import { User } from '@user/user/enitity/user.entity';
import { isISO8601 } from 'class-validator';

@Controller('health-habits')
export class HealthHabitsController {
  constructor(
    private readonly healthHabitService: HealthHabitService,
    private readonly userHealtHabit: UserHealtHabitService,
  ) {}

  @Get('')
  findAll(@Query('search') search?: string, @Query('type') type?: string) {
    let normalizedType: 'health' | 'habit' | undefined;

    if (type) {
      if (type !== 'health' && type !== 'habit') {
        throw new BadRequestException(
          'Invalid type. Allowed values are "health" or "habit".',
        );
      }

      normalizedType = type;
    }

    return this.healthHabitService.findAll({
      search,
      type: normalizedType,
    });
  }

  @Post('')
  async create(
    @Body() createUserHealthHabitDataDto: CreateUserHealthHabitDto,
    @CurrentUser() user: User,
  ): Promise<UserHealthHabit> {
    return await this.userHealtHabit.createUserHealthHabit(
      createUserHealthHabitDataDto,
      user,
    );
  }

  @Get('favorites')
  async findFavorites(
    @CurrentUser() user: User,
    @Query('date') date?: string,
  ): Promise<UserHealthHabit[]> {
    if (date && !isISO8601(date)) {
      throw new BadRequestException(
        'Invalid date format. Please use ISO 8601 format.',
      );
    }

    return await this.userHealtHabit.findUserFavoriteHealthHabitsByUserId(
      user.id,
      date ? new Date(date) : new Date(),
    );
  }
}
