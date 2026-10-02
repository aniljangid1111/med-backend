import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MedicationService } from '@app/medication';
import { CreateMedicineDto } from '@app/medication/dto/create-medicine.dto';
import { UpdateMedicineDto } from '@app/medication/dto/update-medicine.dto';
import { ListMedicinesDto } from '@app/medication/dto/list-medicines.dto';

@Controller('medicines')
export class MedicineController {
  constructor(private readonly medicationService: MedicationService) {}

  /**
   * [Admin] Add a new medicine to the catalog.
   * POST /api/v1/medicines
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createMedicine(@Body() dto: CreateMedicineDto) {
    return this.medicationService.createMedicine(dto);
  }

  /**
   * List all medicines with optional search, pagination and filters.
   * GET /api/v1/medicines
   */
  @Get()
  async getAllMedicines(@Query() query: ListMedicinesDto) {
    return this.medicationService.listMedicines(query);
  }

  /**
   * Get a single medicine by its UUID.
   * GET /api/v1/medicines/:id
   */
  @Get(':id')
  async getMedicineById(@Param('id', ParseUUIDPipe) id: string) {
    return this.medicationService.getMedicineById(id);
  }

  /**
   * [Admin] Update an existing medicine by its UUID.
   * PATCH /api/v1/medicines/:id
   */
  @Patch(':id')
  async updateMedicine(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMedicineDto,
  ) {
    return this.medicationService.updateMedicine(id, dto);
  }

  /**
   * [Admin] Delete a medicine from the catalog by its UUID.
   * DELETE /api/v1/medicines/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteMedicine(@Param('id', ParseUUIDPipe) id: string) {
    await this.medicationService.deleteMedicine(id);
    return { message: 'Medicine deleted successfully' };
  }
}
