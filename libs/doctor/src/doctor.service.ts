import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  /**
   * Create a new Doctor record associated with the user.
   */
  async create(createDto: CreateDoctorDto, userId?: string): Promise<Doctor> {
    const doctor = this.doctorRepository.create({
      ...createDto,
      ...(userId ? { userId } : {}),
    });
    return this.doctorRepository.save(doctor);
  }

  /**
   * Get all doctors: includes user-added doctors for the authenticated user
   * plus global/promoted doctors added by admin (where userId IS NULL).
   */
  async findAll(query: { search?: string; userId?: string } = {}) {
    const { search, userId } = query;
    let qb: SelectQueryBuilder<Doctor> =
      this.doctorRepository.createQueryBuilder('doctor');

    if (userId) {
      qb = qb.andWhere('(doctor.userId = :userId OR doctor.userId IS NULL)', {
        userId,
      });
    }

    if (search) {
      const s = `%${search.trim().toLowerCase()}%`;
      qb = qb.andWhere(
        '(LOWER(doctor.doctorName) LIKE :s OR LOWER(doctor.speciality) LIKE :s OR LOWER(doctor.address) LIKE :s)',
        { s },
      );
    }

    return qb.orderBy('doctor.doctorName', 'ASC').getMany();
  }

  /**
   * Get specific doctor by ID (accessible if owned by user OR if global/promoted).
   */
  async findOne(id: string, userId?: string): Promise<Doctor> {
    let qb = this.doctorRepository
      .createQueryBuilder('doctor')
      .where('doctor.id = :id', { id });

    if (userId) {
      qb = qb.andWhere('(doctor.userId = :userId OR doctor.userId IS NULL)', {
        userId,
      });
    }

    const doctor = await qb.getOne();
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  /**
   * Update doctor record (only the owner can update their own doctor; promoted doctors cannot be modified by users).
   */
  async update(id: string, updateDto: UpdateDoctorDto, userId?: string): Promise<Doctor> {
    const doctor = await this.findOne(id, userId);
    if (userId && doctor.userId !== userId) {
      throw new ForbiddenException('You can only update your own doctor records');
    }
    Object.assign(doctor, updateDto);
    return this.doctorRepository.save(doctor);
  }

  /**
   * Delete doctor record (only the owner can delete their own doctor).
   */
  async remove(id: string, userId?: string): Promise<void> {
    const doctor = await this.findOne(id, userId);
    if (userId && doctor.userId !== userId) {
      throw new ForbiddenException('You can only delete your own doctor records');
    }
    await this.doctorRepository.delete(doctor.id);
  }
}
