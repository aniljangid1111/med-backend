import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserHealthHabitDataDto } from './dtos/create-user-healt-habit-data.dto';
import { UserHealthHabitData } from './entity/user-healt-habit-data.entity';

@Injectable()
export class UserHealtHabitDataService {
  constructor(
    @InjectRepository(UserHealthHabitData)
    private readonly userHealthHabitDataRepository: Repository<UserHealthHabitData>,
  ) { }

  async createUserHealthHabitData(
    userHealthHabitData: CreateUserHealthHabitDataDto,
  ): Promise<UserHealthHabitData> {
    const normalizedUnitUsed = userHealthHabitData.unitUsed?.trim() || null;
    const recordDate = userHealthHabitData.date
      ? new Date(userHealthHabitData.date)
      : new Date();

    const entity = this.userHealthHabitDataRepository.create({
      ...userHealthHabitData,
      date: recordDate,
      reportedAt: userHealthHabitData.reportedAt
        ? new Date(userHealthHabitData.reportedAt)
        : recordDate,
      numericResult: userHealthHabitData.numericResult ?? null,
      unitUsed: normalizedUnitUsed,
      contextNote: userHealthHabitData.contextNote?.trim() || null,
    });

    const saved = await this.userHealthHabitDataRepository.save(entity);
    return this.findUserHealthHabitDataById(saved.id);
  }

  async findUserHealthHabitDataById(id: string): Promise<UserHealthHabitData> {
    const data = await this.userHealthHabitDataRepository
      .createQueryBuilder('data')
      .leftJoinAndSelect('data.healthHabit', 'healthHabit')
      .leftJoinAndSelect('healthHabit.components', 'components')
      .leftJoinAndSelect('components.unitReferences', 'unitReferences')
      .leftJoinAndSelect('data.componentDefinition', 'componentDefinition')
      .leftJoinAndSelect(
        'componentDefinition.unitReferences',
        'compDefUnitRefs',
      )
      .leftJoinAndSelect('data.user', 'user')
      .where('data.id = :id', { id })
      .orderBy('components.componentName', 'ASC')
      .addOrderBy('unitReferences.unit', 'ASC')
      .getOne();
    if (!data) {
      throw new NotFoundException();
    }
    return data;
  }

  async findAllUserHealthHabitData(): Promise<UserHealthHabitData[]> {
    return this.userHealthHabitDataRepository
      .createQueryBuilder('data')
      .leftJoinAndSelect('data.healthHabit', 'healthHabit')
      .leftJoinAndSelect('healthHabit.components', 'components')
      .leftJoinAndSelect('components.unitReferences', 'unitReferences')
      .leftJoinAndSelect('data.componentDefinition', 'componentDefinition')
      .leftJoinAndSelect(
        'componentDefinition.unitReferences',
        'compDefUnitRefs',
      )
      .leftJoinAndSelect('data.user', 'user')
      .orderBy('data.reportedAt', 'DESC')
      .addOrderBy('components.componentName', 'ASC')
      .addOrderBy('unitReferences.unit', 'ASC')
      .getMany();
  }

  async updateUserHealthHabitData(
    id: string,
    userHealthHabitData: Partial<CreateUserHealthHabitDataDto>,
  ): Promise<UserHealthHabitData> {
    const updatePayload: Partial<UserHealthHabitData> = {};

    if (userHealthHabitData.healthHabitId !== undefined) {
      updatePayload.healthHabitId = userHealthHabitData.healthHabitId;
    }

    if (userHealthHabitData.userId !== undefined) {
      updatePayload.userId = userHealthHabitData.userId;
    }

    if (userHealthHabitData.componentDefinitionId !== undefined) {
      updatePayload.componentDefinitionId =
        userHealthHabitData.componentDefinitionId;
    }

    if (userHealthHabitData.date !== undefined) {
      updatePayload.date = new Date(userHealthHabitData.date);
    }

    if (userHealthHabitData.reportedAt !== undefined) {
      updatePayload.reportedAt = userHealthHabitData.reportedAt
        ? new Date(userHealthHabitData.reportedAt)
        : (updatePayload.date || new Date());
    }

    if (userHealthHabitData.resultValue !== undefined) {
      updatePayload.resultValue = userHealthHabitData.resultValue;
    }

    if (userHealthHabitData.numericResult !== undefined) {
      updatePayload.numericResult = userHealthHabitData.numericResult ?? null;
    }

    if (userHealthHabitData.unitUsed !== undefined) {
      updatePayload.unitUsed = userHealthHabitData.unitUsed?.trim() || null;
    }

    await this.userHealthHabitDataRepository.update(id, updatePayload);
    return this.findUserHealthHabitDataById(id);
  }

  async deleteUserHealthHabitData(id: string): Promise<void> {
    const result = await this.userHealthHabitDataRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException();
    }
  }

  async deleteByHealthHabitId(
    healthHabitId: number,
    userId?: string,
  ): Promise<void> {
    const query = this.userHealthHabitDataRepository
      .createQueryBuilder()
      .delete()
      .from(UserHealthHabitData)
      .where('healthHabitId = :healthHabitId', { healthHabitId });

    if (userId) {
      query.andWhere('userId = :userId', { userId });
    }

    await query.execute();
  }

  async findByUserIdAndDate(
    userId: string,
    date: Date,
  ): Promise<UserHealthHabitData[]> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    return this.userHealthHabitDataRepository
      .createQueryBuilder('userHealthHabitData')
      .leftJoinAndSelect('userHealthHabitData.healthHabit', 'healthHabit')
      .leftJoinAndSelect('healthHabit.components', 'components')
      .leftJoinAndSelect('components.unitReferences', 'unitReferences')
      .leftJoinAndSelect(
        'userHealthHabitData.componentDefinition',
        'componentDefinition',
      )
      .leftJoinAndSelect(
        'componentDefinition.unitReferences',
        'compDefUnitRefs',
      )
      .where('userHealthHabitData.userId = :userId', { userId })
      .andWhere('userHealthHabitData.date >= :startOfDay', { startOfDay })
      .andWhere('userHealthHabitData.date < :endOfDay', { endOfDay })
      .orderBy('userHealthHabitData.reportedAt', 'DESC')
      .addOrderBy('components.componentName', 'ASC')
      .addOrderBy('unitReferences.unit', 'ASC')
      .getMany();
  }

  async findHealthHabitByUserFavorite(
    userId: string,
  ): Promise<UserHealthHabitData[]> {
    const query = this.userHealthHabitDataRepository
      .createQueryBuilder('userHealthHabitData')
      .leftJoinAndSelect('userHealthHabitData.healthHabit', 'healthHabit')
      .leftJoinAndSelect('healthHabit.components', 'components')
      .leftJoinAndSelect('components.unitReferences', 'unitReferences')
      .leftJoinAndSelect(
        'userHealthHabitData.componentDefinition',
        'componentDefinition',
      )
      .leftJoinAndSelect(
        'componentDefinition.unitReferences',
        'compDefUnitRefs',
      )
      .innerJoin(
        'user_health_habits',
        'userHealthHabit',
        'userHealthHabit.healthHabitId = userHealthHabitData.healthHabitId AND userHealthHabit.userId = :userId',
        { userId },
      )
      .where('userHealthHabit.isFavorite = true')
      .andWhere('healthHabit.isActive = true')
      .orderBy('userHealthHabitData.reportedAt', 'DESC')
      .addOrderBy('components.componentName', 'ASC')
      .addOrderBy('unitReferences.unit', 'ASC');
    return query.getMany();
  }

  /**
   * Fetches paginated data for a single health habit of a user.
   * @param userId - The user's ID
   * @param healthHabitId - The health habit ID to fetch data for
   * @param page - Page number (1-indexed, defaults to 1)
   * @param limit - Number of items per page (defaults to 10)
   * @returns Paginated health habit data with metadata
   */
  async findUserHealthHabitDataByHealthHabitId(
    userId: string,
    healthHabitId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: UserHealthHabitData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const query = this.userHealthHabitDataRepository
      .createQueryBuilder('userHealthHabitData')
      .leftJoinAndSelect('userHealthHabitData.healthHabit', 'healthHabit')
      .leftJoinAndSelect('healthHabit.components', 'components')
      .leftJoinAndSelect('components.unitReferences', 'unitReferences')
      .leftJoinAndSelect(
        'userHealthHabitData.componentDefinition',
        'componentDefinition',
      )
      .leftJoinAndSelect(
        'componentDefinition.unitReferences',
        'compDefUnitRefs',
      )
      .where('userHealthHabitData.userId = :userId', { userId })
      .andWhere('userHealthHabitData.healthHabitId = :healthHabitId', {
        healthHabitId,
      })
      .orderBy('userHealthHabitData.reportedAt', 'DESC')
      .addOrderBy('components.componentName', 'ASC')
      .addOrderBy('unitReferences.unit', 'ASC')
      .skip(skip)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
