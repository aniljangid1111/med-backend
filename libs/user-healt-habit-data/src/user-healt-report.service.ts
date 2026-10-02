import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserHealthHabitData } from './entity/user-healt-habit-data.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserHealtHabitReportService {
  private readonly logger = new Logger(UserHealtHabitReportService.name);
  constructor(
    @InjectRepository(UserHealthHabitData)
    private readonly userHealthHabitDataRepository: Repository<UserHealthHabitData>,
  ) { }

  async getReportByUserId(
    userId: string,
    healthHabitId: string,
    fromDate: string,
    toDate: string,
  ): Promise<any> {
    return await this.userHealthHabitDataRepository
      .createQueryBuilder('userHealthHabitData')
      .select([
        'DATE(userHealthHabitData.date) as date',
        'JSON_EXTRACT(userHealthHabitData.data, "$.value") as value',
        'JSON_EXTRACT(userHealthHabitData.data, "$.unit") as unit',
      ])
      .where('userHealthHabitData.userId = :userId', { userId })
      .andWhere('userHealthHabitData.healthHabitId = :healthHabitId', {
        healthHabitId,
      })
      .andWhere(
        'DATE(userHealthHabitData.date) BETWEEN :fromDate AND :toDate',
        {
          fromDate,
          toDate,
        },
      )
      .orderBy('DATE(userHealthHabitData.date)', 'ASC')
      .getRawMany();
  }

  async getLastDataForSingleTest(
    userId: string,
    healthHabitId: string,
  ): Promise<UserHealthHabitData | null> {
    return await this.userHealthHabitDataRepository
      .createQueryBuilder('userHealthHabitData')
      .where('userHealthHabitData.userId = :userId', { userId })
      .andWhere('userHealthHabitData.healthHabitId = :healthHabitId', {
        healthHabitId,
      })
      .orderBy('userHealthHabitData.date', 'DESC')
      .getOne();
  }

  async getAllDataWithPagination(
    userId: string,
    healthHabitId?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: UserHealthHabitData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryBuilder = this.userHealthHabitDataRepository
      .createQueryBuilder('userHealthHabitData')
      .leftJoinAndSelect('userHealthHabitData.healthHabit', 'healthHabit')
      .where('userHealthHabitData.userId = :userId', { userId });

    if (healthHabitId) {
      queryBuilder.andWhere(
        'userHealthHabitData.healthHabitId = :healthHabitId',
        {
          healthHabitId,
        },
      );
    }

    queryBuilder.orderBy('userHealthHabitData.date', 'DESC');

    const total = await queryBuilder.getCount();
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const data = await queryBuilder.skip(offset).take(limit).getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getLineChartData(
    userId: string,
    healthHabitId: number,
    period?: 'weekly' | 'monthly' | 'quarterly' | 'custom',
    startDateStr?: string,
    endDateStr?: string,
  ) {
    let endDate = new Date();
    let startDate = new Date();

    if (period === 'custom' && startDateStr && endDateStr) {
      startDate = new Date(startDateStr);
      endDate = new Date(endDateStr);
    } else {
      const selectedPeriod = period || 'weekly';
      switch (selectedPeriod) {
        case 'weekly':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarterly':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7); // Default to weekly
      }
    }

    const rawData = await this.userHealthHabitDataRepository
      .createQueryBuilder('data')
      .leftJoin('data.componentDefinition', 'component')
      .select([
        'data.date AS date',
        'data.numericResult AS value',
        'data.unitUsed AS unit',
        'component.componentName AS "componentName"',
      ])
      .where('data.userId = :userId', { userId })
      .andWhere('data.healthHabitId = :healthHabitId', { healthHabitId })
      .andWhere('data.date BETWEEN :startDate AND :endDate', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })
      .andWhere('data.numericResult IS NOT NULL')
      .orderBy('data.date', 'ASC')
      .getRawMany();

    // Group by component name
    const result: Record<
      string,
      { date: string; value: number; unit: string }[]
    > = {};

    rawData.forEach((row) => {

      const componentName = row.componentName || 'Default';
      if (!result[componentName]) {
        result[componentName] = [];
      }
      result[componentName].push({
        date: row.date,
        value: Number(row.value),
        unit: row.unit,
      });
    });

    return result;
  }
}
