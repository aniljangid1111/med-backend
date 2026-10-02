import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserHealthHabit } from './entitiy/user-healt-habit.entity';
import { Repository } from 'typeorm';
import { CreateUserHealthHabitDto } from './dtos/create-user-healt-habit.dto';
import { User } from '@user/user/enitity/user.entity';
import { UserHealthHabitData } from '@user-healt-habit-data/user-healt-habit-data/entity/user-healt-habit-data.entity';

@Injectable()
export class UserHealtHabitService {
  constructor(
    @InjectRepository(UserHealthHabit)
    private userHealthHabitRepository: Repository<UserHealthHabit>,
  ) { }

  async createUserHealthHabit(
    createUserHealthHabitDto: CreateUserHealthHabitDto,
    user: User,
  ): Promise<UserHealthHabit> {
    const checkAlreadyExist = await this.userHealthHabitRepository.findOne({
      where: {
        userId: user.id,
        healthHabitId: createUserHealthHabitDto.healthHabitId.toString(),
      },
    });

    if (checkAlreadyExist) {
      throw new BadRequestException('Health habit already exists');
    }

    const userHealthHabit = this.userHealthHabitRepository.create({
      ...createUserHealthHabitDto,
      userId: user.id,
      healthHabitId: createUserHealthHabitDto.healthHabitId.toString(),
    });
    return this.userHealthHabitRepository.save(userHealthHabit);
  }

  async findUserHealthHabitsByUserId(
    userId: string,
  ): Promise<UserHealthHabit[]> {
    return this.userHealthHabitRepository
      .createQueryBuilder('userHealthHabit')
      .leftJoinAndSelect('userHealthHabit.healthHabit', 'healthHabit')
      .leftJoinAndSelect('healthHabit.components', 'components')
      .leftJoinAndSelect('components.unitReferences', 'unitReferences')
      .where('userHealthHabit.userId = :userId', { userId })
      .orderBy('healthHabit.name', 'ASC')
      .addOrderBy('components.componentName', 'ASC')
      .addOrderBy('unitReferences.unit', 'ASC')
      .getMany();
  }

  async findUserHealthHabitsByHealthHabitId(
    healthHabitId: string,
  ): Promise<UserHealthHabit[]> {
    return this.userHealthHabitRepository.find({
      where: { healthHabitId },
      relations: ['user'],
    });
  }

  async findUserHealthHabitById(id: string): Promise<UserHealthHabit> {
    const healthHabit = await this.userHealthHabitRepository
      .createQueryBuilder('userHealthHabit')
      .leftJoinAndSelect('userHealthHabit.user', 'user')
      .leftJoinAndSelect('userHealthHabit.healthHabit', 'healthHabit')
      .leftJoinAndSelect('healthHabit.components', 'components')
      .leftJoinAndSelect('components.unitReferences', 'unitReferences')
      .where('userHealthHabit.id = :id', { id })
      .orderBy('components.componentName', 'ASC')
      .addOrderBy('unitReferences.unit', 'ASC')
      .getOne();
    if (!healthHabit) {
      throw new NotFoundException();
    }
    return healthHabit;
  }

  async findUserFavoriteHealthHabitsByUserId(
    userId: string,
    date?: Date,
  ): Promise<UserHealthHabit[]> {
    const query = this.userHealthHabitRepository
      .createQueryBuilder('userHealthHabit')
      .leftJoinAndSelect('userHealthHabit.healthHabit', 'healthHabit')
      .leftJoinAndSelect('healthHabit.components', 'components')
      .leftJoinAndSelect('components.unitReferences', 'unitReferences')
      .leftJoinAndSelect(
        UserHealthHabitData,
        'userHealthHabitData',
        'userHealthHabitData.healthHabitId = userHealthHabit.healthHabitId AND userHealthHabitData.userId = userHealthHabit.userId AND DATE(userHealthHabitData.date) = DATE(:date)',
        { date },
      )
      .where('userHealthHabit.userId = :userId', { userId })
      .andWhere('userHealthHabit.isFavorite = :isFavorite', {
        isFavorite: true,
      })
      .orderBy('healthHabit.name', 'ASC')
      .addOrderBy('components.componentName', 'ASC')
      .addOrderBy('unitReferences.unit', 'ASC');

    return await query.getMany();
  }

  async updateUserHealthHabit(
    id: string,
    updateData: Partial<CreateUserHealthHabitDto>,
  ): Promise<UserHealthHabit> {
    await this.userHealthHabitRepository.update(id, {
      ...updateData,
      healthHabitId: updateData.healthHabitId?.toString(),
    });
    const updatedHealthHabit = await this.findUserHealthHabitById(id);
    return updatedHealthHabit;
  }

  async getUserHealthHabitStatsByDate(
    userId: string,
    date: Date,
  ): Promise<{
    total_healths: number;
    total_habits: number;
    total_filled_healths: number;
    total_filled_habits: number;
  }> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    // Get all user's selected health habits (favorites)
    const userHealthHabits = await this.userHealthHabitRepository
      .createQueryBuilder('userHealthHabit')
      .leftJoinAndSelect('userHealthHabit.healthHabit', 'healthHabit')
      .where('userHealthHabit.userId = :userId', { userId })
      .andWhere('userHealthHabit.isFavorite = :isFavorite', {
        isFavorite: true,
      })
      .andWhere('healthHabit.isActive = :isActive', { isActive: true })
      .getMany();

    // Count total healths and total habits
    let total_healths = 0;
    let total_habits = 0;

    userHealthHabits.forEach((userHealthHabit) => {
      if (userHealthHabit.healthHabit.type === 'health') {
        total_healths++;
      } else if (userHealthHabit.healthHabit.type === 'habit') {
        total_habits++;
      }
    });

    // Get total filled healths for the given date
    const healthResult = await this.userHealthHabitRepository
      .createQueryBuilder('userHealthHabit')
      .leftJoin('userHealthHabit.healthHabit', 'healthHabit')
      .innerJoin(
        UserHealthHabitData,
        'userHealthHabitData',
        'userHealthHabitData.healthHabitId = userHealthHabit.healthHabitId AND userHealthHabitData.userId = userHealthHabit.userId',
      )
      .where('userHealthHabit.userId = :userId', { userId })
      .andWhere('userHealthHabit.isFavorite = :isFavorite', {
        isFavorite: true,
      })
      .andWhere('healthHabit.isActive = :isActive', { isActive: true })
      .andWhere('healthHabit.type = :type', { type: 'health' })
      .andWhere('userHealthHabitData.date >= :startOfDay', { startOfDay })
      .andWhere('userHealthHabitData.date < :endOfDay', { endOfDay })
      .select('COUNT(DISTINCT userHealthHabit.healthHabitId)', 'count')
      .getRawOne<{ count: string }>();

    const total_filled_healths = healthResult
      ? parseInt(healthResult.count, 10) || 0
      : 0;

    // Get total filled habits for the given date
    const habitResult = await this.userHealthHabitRepository
      .createQueryBuilder('userHealthHabit')
      .leftJoin('userHealthHabit.healthHabit', 'healthHabit')
      .innerJoin(
        UserHealthHabitData,
        'userHealthHabitData',
        'userHealthHabitData.healthHabitId = userHealthHabit.healthHabitId AND userHealthHabitData.userId = userHealthHabit.userId',
      )
      .where('userHealthHabit.userId = :userId', { userId })
      .andWhere('userHealthHabit.isFavorite = :isFavorite', {
        isFavorite: true,
      })
      .andWhere('healthHabit.isActive = :isActive', { isActive: true })
      .andWhere('healthHabit.type = :type', { type: 'habit' })
      .andWhere('userHealthHabitData.date >= :startOfDay', { startOfDay })
      .andWhere('userHealthHabitData.date < :endOfDay', { endOfDay })
      .select('COUNT(DISTINCT userHealthHabit.healthHabitId)', 'count')
      .getRawOne<{ count: string }>();

    const total_filled_habits = habitResult
      ? parseInt(habitResult.count, 10) || 0
      : 0;

    return {
      total_healths,
      total_habits,
      total_filled_healths,
      total_filled_habits,
    };
  }

  async getUserFavoriteHealthHabitsWithData(
    userId: string,
    date: Date,
    limit = 4,
  ): Promise<{
    healths: Array<{
      id: string;
      healthHabitId: string;
      healthHabit: {
        id: number;
        name: string;
        description: string | null;
        icon: string | null;
        bgImage: string | null;
        color: string | null;
        type: 'health' | 'habit';
      };
      data: Array<{
        id: string;
        resultValue: string;
        numericResult: number | null;
        unitUsed: string | null;
        contextNote: string | null;
        reportedAt: Date;
        componentDefinition: {
          id: string;
          componentName: string;
          resultType: string;
          normalRangeText: string;
        };
      }> | null;
    }>;
    habits: Array<{
      id: string;
      healthHabitId: string;
      healthHabit: {
        id: number;
        name: string;
        description: string | null;
        icon: string | null;
        bgImage: string | null;
        color: string | null;
        type: 'health' | 'habit';
      };
      data: Array<{
        id: string;
        resultValue: string;
        numericResult: number | null;
        unitUsed: string | null;
        contextNote: string | null;
        reportedAt: Date;
        componentDefinition: {
          id: string;
          componentName: string;
          resultType: string;
          normalRangeText: string;
        };
      }> | null;
    }>;
  }> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    // Get all user's favorite health habits
    const userHealthHabits = await this.userHealthHabitRepository
      .createQueryBuilder('userHealthHabit')
      .leftJoinAndSelect('userHealthHabit.healthHabit', 'healthHabit')
      .where('userHealthHabit.userId = :userId', { userId })
      .andWhere('userHealthHabit.isFavorite = :isFavorite', {
        isFavorite: true,
      })
      .andWhere('healthHabit.isActive = :isActive', { isActive: true })
      .orderBy('healthHabit.name', 'ASC')
      .getMany();

    // Get all data for the specified date
    const healthHabitData = await this.userHealthHabitRepository.manager
      .getRepository(UserHealthHabitData)
      .createQueryBuilder('data')
      .leftJoinAndSelect('data.componentDefinition', 'componentDefinition')
      .where('data.userId = :userId', { userId })
      .andWhere('data.date >= :startOfDay', { startOfDay })
      .andWhere('data.date < :endOfDay', { endOfDay })
      .orderBy('data.reportedAt', 'DESC')
      .getMany();

    // Map data by healthHabitId for quick lookup
    const dataByHealthHabitId = new Map<number, typeof healthHabitData>();
    healthHabitData.forEach((data) => {
      if (!dataByHealthHabitId.has(data.healthHabitId)) {
        dataByHealthHabitId.set(data.healthHabitId, []);
      }
      dataByHealthHabitId.get(data.healthHabitId)!.push(data);
    });

    // Separate and map health habits with their data
    type MappedHealthHabit = {
      id: string;
      healthHabitId: string;
      healthHabit: {
        id: number;
        name: string;
        description: string | null;
        icon: string | null;
        bgImage: string | null;
        color: string | null;
        type: 'health' | 'habit';
      };
      data: Array<{
        id: string;
        resultValue: string;
        numericResult: number | null;
        unitUsed: string | null;
        contextNote: string | null;
        date: Date;
        reportedAt: Date;
        componentDefinition: {
          id: string;
          componentName: string;
          resultType: string;
          normalRangeText: string;
        };
      }> | null;
    };

    const healths: MappedHealthHabit[] = [];
    const habits: MappedHealthHabit[] = [];

    userHealthHabits.forEach((userHealthHabit) => {
      const habitData = dataByHealthHabitId.get(
        Number(userHealthHabit.healthHabitId),
      );

      const mappedData = {
        id: userHealthHabit.id,
        healthHabitId: userHealthHabit.healthHabitId,
        healthHabit: {
          id: userHealthHabit.healthHabit.id,
          name: userHealthHabit.healthHabit.name,
          description: userHealthHabit.healthHabit.description,
          icon: userHealthHabit.healthHabit.icon,
          bgImage: userHealthHabit.healthHabit.bgImage,
          color: userHealthHabit.healthHabit.color,
          type: userHealthHabit.healthHabit.type,
        },
        data: habitData
          ? habitData.map((d) => ({
            id: d.id,
            resultValue: d.resultValue,
            numericResult: d.numericResult,
            unitUsed: d.unitUsed,
            contextNote: d.contextNote,
            date: d.date,
            reportedAt: d.reportedAt,
            componentDefinition: {
              id: d.componentDefinition.id,
              componentName: d.componentDefinition.componentName,
              resultType: d.componentDefinition.resultType,
              normalRangeText: d.componentDefinition.normalRangeText,
            },
          }))
          : null,
      };

      // Separate by type and apply limit
      if (
        userHealthHabit.healthHabit.type === 'health' &&
        healths.length < limit
      ) {
        healths.push(mappedData);
      } else if (
        userHealthHabit.healthHabit.type === 'habit' &&
        habits.length < limit
      ) {
        habits.push(mappedData);
      }
    });

    return {
      healths,
      habits,
    };
  }

  async deleteUserHealthHabit(id: string): Promise<void> {
    const healthHabit = await this.findUserHealthHabitById(id);
    await this.userHealthHabitRepository.remove(healthHabit);
  }

  async toggleFavoriteHealthHabit(id: string, userId: string): Promise<UserHealthHabit> {
    const healthHabit = await this.findUserHealthHabitById(id);

    if (healthHabit.userId !== userId) {
      throw new Error('You are not authorized to toggle this health habit');
    }

    healthHabit.isFavorite = !healthHabit.isFavorite;
    return this.userHealthHabitRepository.save(healthHabit);
  }
}
