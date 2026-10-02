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
import { CurrentUser } from '@auth/auth/decorator/current-user.decorator';
import { User } from '@user/user/enitity/user.entity';
import { DoctorService } from '@doctor/doctor';
import { CreateDoctorDto } from '@doctor/doctor/dto/create-doctor.dto';
import { UpdateDoctorDto } from '@doctor/doctor/dto/update-doctor.dto';

@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  /**
   * Add a new doctor for the authenticated user.
   * POST /api/v1/doctors
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDoctor(
    @CurrentUser() user: User,
    @Body() dto: CreateDoctorDto,
  ) {
    return this.doctorService.create(dto, user.id);
  }

  /**
   * List all doctors belonging to the authenticated user.
   * GET /api/v1/doctors
   */
  @Get()
  async getAllDoctors(
    @CurrentUser() user: User,
    @Query('search') search?: string,
  ) {
    return this.doctorService.findAll({ search, userId: user.id });
  }

  /**
   * Get specific doctor details by their UUID for the authenticated user.
   * GET /api/v1/doctors/:id
   */
  @Get(':id')
  async getDoctorById(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.doctorService.findOne(id, user.id);
  }

  /**
   * Update an existing doctor entry belonging to the authenticated user.
   * PATCH /api/v1/doctors/:id
   */
  @Patch(':id')
  async updateDoctor(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDoctorDto,
  ) {
    return this.doctorService.update(id, dto, user.id);
  }

  /**
   * Remove a doctor belonging to the authenticated user.
   * DELETE /api/v1/doctors/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteDoctor(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.doctorService.remove(id, user.id);
    return { message: 'Doctor record deleted successfully' };
  }
}
