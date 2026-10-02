import { CurrentUser } from '@auth/auth/decorator/current-user.decorator';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UserHealtHabitReportService } from '@user-healt-habit-data/user-healt-habit-data/user-healt-report.service';
import { UserHealtHabitDataService } from '@user-healt-habit-data/user-healt-habit-data/user-healt-habit-data.service';
import { AddHealthHabitDataDto } from '@user-healt-habit-data/user-healt-habit-data/dtos/add-health-habit-data.dto';
import { CreateUserHealthHabitDataDto } from '@user-healt-habit-data/user-healt-habit-data/dtos/create-user-healt-habit-data.dto';
import { User } from '@user/user/enitity/user.entity';

@Controller('reports/habit')
export class HabitControllerTsController {
  constructor(
    private readonly userHealtHabitReportService: UserHealtHabitReportService,
    private readonly userHealtHabitDataService: UserHealtHabitDataService,
  ) {}

  @Get(':health/chart')
  async getHabitReport(
    @Param('health') healthHabitId: string,
    @CurrentUser() user: User,
  ): Promise<any> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7); // 7 days ago
    const toDate = new Date();

    return this.userHealtHabitReportService.getReportByUserId(
      user.id,
      healthHabitId,
      fromDate.toISOString().split('T')[0],
      toDate.toISOString().split('T')[0],
    );
  }

  @Get(':health/last')
  async getLastDataForSingleTest(
    @Param('health') healthHabitId: string,
    @CurrentUser() user: User,
  ): Promise<any> {
    return this.userHealtHabitReportService.getLastDataForSingleTest(
      user.id,
      healthHabitId,
    );
  }

  @Get(':health/all')
  async getAllDataWithPagination(
    @Param('health') healthHabitId: string,
    @CurrentUser() user: User,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<any> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    return this.userHealtHabitReportService.getAllDataWithPagination(
      user.id,
      healthHabitId,
      pageNumber,
      limitNumber,
    );
  }

  @Post('add')
  async addHealthHabitData(
    @Body() addHealthHabitDataDto: AddHealthHabitDataDto,
    @CurrentUser() user: User,
  ): Promise<any> {
    const { healthHabitId, date, data } = addHealthHabitDataDto;

    if (!data) {
      throw new BadRequestException('Data payload is required.');
    }

    const {
      componentDefinitionId,
      resultValue,
      numericResult,
      unitUsed,
      contextNote,
      reportedAt,
    } = data as Record<string, unknown>;

    if (typeof componentDefinitionId !== 'string' || !componentDefinitionId) {
      throw new BadRequestException(
        'componentDefinitionId must be a non-empty string.',
      );
    }

    if (
      resultValue === undefined ||
      resultValue === null ||
      (typeof resultValue !== 'string' && typeof resultValue !== 'number')
    ) {
      throw new BadRequestException(
        'resultValue must be provided as a string or number.',
      );
    }

    const normalizedResultValue =
      typeof resultValue === 'number'
        ? resultValue.toString()
        : resultValue.trim();

    if (!normalizedResultValue.length) {
      throw new BadRequestException('resultValue cannot be empty.');
    }

    const parsedHealthHabitId = Number(healthHabitId);
    if (!Number.isFinite(parsedHealthHabitId)) {
      throw new BadRequestException(
        'healthHabitId must be a valid numeric identifier.',
      );
    }

    const resultDate = new Date(date);
    if (Number.isNaN(resultDate.getTime())) {
      throw new BadRequestException('date must be a valid ISO date string.');
    }

    let parsedReportedAt: string | undefined;
    if (reportedAt !== undefined && reportedAt !== null) {
      const reportedAtDate = new Date(reportedAt as string);
      if (Number.isNaN(reportedAtDate.getTime())) {
        throw new BadRequestException(
          'reportedAt must be a valid ISO date string.',
        );
      }
      parsedReportedAt = reportedAtDate.toISOString();
    } else {
      parsedReportedAt = resultDate.toISOString();
    }

    const numericResultValue =
      numericResult !== undefined && numericResult !== null
        ? Number(numericResult)
        : undefined;

    if (
      numericResultValue !== undefined &&
      (Number.isNaN(numericResultValue) || !Number.isFinite(numericResultValue))
    ) {
      throw new BadRequestException('numericResult must be a finite number.');
    }

    const createDto: CreateUserHealthHabitDataDto = {
      healthHabitId: parsedHealthHabitId,
      userId: user.id,
      componentDefinitionId,
      date: resultDate.toISOString(),
      resultValue: normalizedResultValue,
      numericResult: numericResultValue,
      unitUsed:
        typeof unitUsed === 'string' && unitUsed.trim().length > 0
          ? unitUsed.trim()
          : undefined,
      contextNote:
        typeof contextNote === 'string' && contextNote.trim().length > 0
          ? contextNote.trim()
          : undefined,
      reportedAt: parsedReportedAt,
    };

    return this.userHealtHabitDataService.createUserHealthHabitData(createDto);
  }
}
