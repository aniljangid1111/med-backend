import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Medicine } from './entity/medicine.entity';
import { UserMedication } from './entity/user-medication.enity';
import { MedicationLog } from './entity/medication-logs.entity';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { ListMedicinesDto } from './dto/list-medicines.dto';
import { MedicationLogsQueryDto } from './dto/medication-logs-query.dto';

export interface ListMedicinesOptions {
  page?: number; // 1-based
  limit?: number;
  search?: string;
  dateFrom?: string | Date;
  dateTo?: string | Date;
  isPrescriptionRequired?: boolean;
  sortBy?: string; // field name
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class MedicationService {
  constructor(
    @InjectRepository(Medicine)
    private readonly medicineRepository: Repository<Medicine>,

    @InjectRepository(UserMedication)
    private readonly userMedicationRepository: Repository<UserMedication>,

    @InjectRepository(MedicationLog)
    private readonly medicationLogRepository: Repository<MedicationLog>,
  ) {}

  /**
   * Create a new Medicine record.
   */
  async createMedicine(createDto: CreateMedicineDto): Promise<Medicine> {
    const medicine = this.medicineRepository.create(
      createDto as Partial<Medicine>,
    );
    return this.medicineRepository.save(medicine);
  }

  /**
   * Get a medicine by id. Throws NotFoundException when missing.
   */
  async getMedicineById(id: string): Promise<Medicine> {
    const med = await this.medicineRepository.findOneBy({ id });
    if (!med) throw new NotFoundException('Medicine not found');
    return med;
  }

  /**
   * Update an existing medicine.
   */
  async updateMedicine(
    id: string,
    updateDto: UpdateMedicineDto,
  ): Promise<Medicine> {
    const med = await this.getMedicineById(id);
    Object.assign(med, updateDto);
    return this.medicineRepository.save(med);
  }

  /**
   * Delete a medicine by id.
   */
  async deleteMedicine(id: string): Promise<void> {
    const med = await this.getMedicineById(id);
    await this.medicineRepository.delete(med.id);
  }

  /**
   * List medicines with pagination, search and date filters.
   * Returns { items, total, page, limit }
   */
  async listMedicines(options: ListMedicinesDto | ListMedicinesOptions = {}) {
    const page =
      (options as any).page && (options as any).page > 0
        ? (options as any).page
        : 1;
    const limit =
      (options as any).limit && (options as any).limit > 0
        ? (options as any).limit
        : 50;
    const offset = (page - 1) * limit;

    let qb: SelectQueryBuilder<Medicine> =
      this.medicineRepository.createQueryBuilder('medicine');

    // Search across brandName, genericName, description and manufacturer
    const searchTerm = (options as any).search;
    if (searchTerm) {
      const s = `%${(searchTerm as string).trim().toLowerCase()}%`;
      qb = qb.andWhere(
        '(LOWER(medicine.brandName) LIKE :s OR LOWER(medicine.genericName) LIKE :s OR LOWER(medicine.description) LIKE :s OR LOWER(medicine.manufacturer) LIKE :s)',
        { s },
      );
    }

    // Prescription filter
    const isPrescriptionRaw = (options as any).isPrescriptionRequired;
    if (typeof isPrescriptionRaw !== 'undefined') {
      // ListMedicinesDto accepts boolean as string from query params, so handle both
      const isPrescription =
        isPrescriptionRaw === true || isPrescriptionRaw === 'true';
      qb = qb.andWhere('medicine.isPrescriptionRequired = :isPrescription', {
        isPrescription,
      });
    }

    // Date range filter on createdAt
    const dateFrom = (options as any).dateFrom;
    const dateTo = (options as any).dateTo;
    if (dateFrom) {
      const from = this.parseDate(dateFrom);
      qb = qb.andWhere('medicine.createdAt >= :from', {
        from: from.toISOString(),
      });
    }
    if (dateTo) {
      const to = this.parseDate(dateTo);
      // include end of day for 'to' to be intuitive
      to.setHours(23, 59, 59, 999);
      qb = qb.andWhere('medicine.createdAt <= :to', { to: to.toISOString() });
    }

    // Sorting
    const allowedSortFields = [
      'createdAt',
      'brandName',
      'genericName',
      'updatedAt',
    ];
    const requestedSort =
      typeof (options as any).sortBy === 'string'
        ? (options as any).sortBy
        : undefined;
    const sortBy =
      requestedSort && allowedSortFields.includes(requestedSort)
        ? requestedSort
        : 'createdAt';
    const sortOrder = (options as any).sortOrder === 'ASC' ? 'ASC' : 'DESC';
    qb = qb.orderBy(`medicine.${sortBy}`, sortOrder);

    const [items, total] = await qb.skip(offset).take(limit).getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Helper to parse date inputs.
   */
  private parseDate(d: string | Date): Date {
    if (d instanceof Date) return d;
    const parsed = new Date(d);
    if (isNaN(parsed.getTime())) throw new BadRequestException('Invalid date');
    return parsed;
  }

  /**
   * Get all user medication plans for a user (includes eager medicine relation on entity).
   */
  async getUserMedications(userId: string): Promise<UserMedication[]> {
    return this.userMedicationRepository.find({ where: { userId } });
  }

  /**
   * Get medication logs for a user medication id with optional date range.
   */
  async getMedicationLogs(
    userMedicationId: string,
    query?: MedicationLogsQueryDto,
  ) {
    let qb = this.medicationLogRepository
      .createQueryBuilder('log')
      .where('log.userMedication = :userMedicationId', { userMedicationId });

    if (query?.dateFrom) {
      const from = this.parseDate(query.dateFrom);
      qb = qb.andWhere('log.logDate >= :from', {
        from: from.toISOString().split('T')[0],
      });
    }
    if (query?.dateTo) {
      const to = this.parseDate(query.dateTo);
      qb = qb.andWhere('log.logDate <= :to', {
        to: to.toISOString().split('T')[0],
      });
    }

    return qb.orderBy('log.logDate', 'DESC').getMany();
  }
}
