import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
  ParseDatePipe,
  BadRequestException,
} from '@nestjs/common';
import { CurrentUser } from '@auth/auth/decorator/current-user.decorator';
import { User } from '@user/user/enitity/user.entity';
import { UserMedicationService } from '@app/medication';
import { CreateUserMedicationDto } from '@app/medication/dto/create-user-medication.dto';
import { UpdateUserMedicationDto } from '@app/medication/dto/update-user-medication.dto';
import { CreateMedicationLogDto } from '@app/medication/dto/create-medication-log.dto';
import { isISO8601 } from 'class-validator';

@Controller('user-medications')
export class UserMedicationController {
  constructor(private readonly userMedicationService: UserMedicationService) {}

  @Get()
  async getMyMedications(@CurrentUser() user: User) {
    return this.userMedicationService.getUserMedications(user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createMyMedication(
    @CurrentUser() user: User,
    @Body() dto: CreateUserMedicationDto,
  ) {
    return this.userMedicationService.createUserMedication(user.id, dto);
  }

  @Patch(':id')
  async updateMyMedication(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserMedicationDto,
  ) {
    return this.userMedicationService.updateUserMedication(id, user.id, dto);
  }

  @Delete(':id')
  async removeMyMedication(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.userMedicationService.removeUserMedication(id, user.id);
  }

  @Post(':id/logs')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async logMedication(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMedicationLogDto,
  ) {
    return this.userMedicationService.logMedication(user.id, id, dto as any);
  }

  @Get('by-date')
  async getMedicationsByDate(
    @CurrentUser() user: User,
    @Query('date') date?: string,
  ) {
    let validatedDate = new Date();

    if (date) {
      if (!isISO8601(date)) {
        throw new BadRequestException(
          'Invalid date format. Please use ISO 8601 format (e.g., 2024-10-04 or 2024-10-04T00:00:00Z).',
        );
      }
      validatedDate = new Date(date);
      if (isNaN(validatedDate.getTime())) {
        throw new BadRequestException('Invalid date provided.');
      }
    }

    return this.userMedicationService.getMedicationsForDate(
      user.id,
      validatedDate,
    );
  }
}
