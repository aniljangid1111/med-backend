import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserMedication } from './entity/user-medication.enity';
import { MedicationLog } from './entity/medication-logs.entity';
import { DoseTimeOfDay } from './entity/medication-logs.entity';
import { CreateUserMedicationDto } from './dto/create-user-medication.dto';
import { UpdateUserMedicationDto } from './dto/update-user-medication.dto';
import { Medicine } from './entity/medicine.entity';

@Injectable()
export class UserMedicationService {
  constructor(
    @InjectRepository(UserMedication)
    private readonly userMedicationRepository: Repository<UserMedication>,

    @InjectRepository(Medicine)
    private readonly medicineRepository: Repository<Medicine>,

    @InjectRepository(MedicationLog)
    private readonly medicationLogRepository: Repository<MedicationLog>,
  ) {}


  /**
   * Create a user medication plan for the given user.
   */
  async createUserMedication(
    userId: string,
    dto: CreateUserMedicationDto,
  ): Promise<UserMedication> {
    let medicineId = dto.medicineId;

    if (!medicineId && dto.medicineName) {
      const trimmedName = dto.medicineName.trim();
      let medicine = await this.medicineRepository.findOne({
        where: [
          { brandName: trimmedName },
          { genericName: trimmedName },
        ],
      });

      if (!medicine) {
        medicine = await this.medicineRepository.save(
          this.medicineRepository.create({
            brandName: trimmedName,
            genericName: trimmedName,
          }),
        );
      }
      medicineId = medicine.id;
    }

    if (!medicineId) {
      throw new BadRequestException(
        'Either medicineId or medicineName must be provided',
      );
    }

    // ensure medicine exists
    const medicine = await this.medicineRepository.findOneBy({
      id: medicineId,
    });
    if (!medicine) throw new NotFoundException('Medicine not found');

    const entity = this.userMedicationRepository.create({
      userId,
      medicineId,
      frequency: dto.frequency,
      dosageType: dto.dosageType,
      morningDosage: dto.morningDosage ?? 0,
      afternoonDosage: dto.afternoonDosage ?? 0,
      eveningDosage: dto.eveningDosage ?? 0,
      nightDosage: dto.nightDosage ?? 0,
      durationValue: dto.durationValue,
      durationUnit: dto.durationUnit,
      instruction: dto.instruction,
      customInstruction: dto.customInstruction,
      startDate: new Date(dto.startDate),
      isActive: typeof dto.isActive === 'boolean' ? dto.isActive : true,
    } as Partial<UserMedication>);

    return this.userMedicationRepository.save(entity);
  }

  /**
   * Get all medication plans for a user.
   */
  async getUserMedications(userId: string): Promise<UserMedication[]> {
    return this.userMedicationRepository.find({
      where: { userId },
      relations: ['medicine'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update a user medication plan by its id. Only the owner or admin should call this in controller.
   */
  async updateUserMedication(
    id: string,
    userId: string,
    dto: UpdateUserMedicationDto,
  ): Promise<UserMedication> {
    const entity = await this.userMedicationRepository.findOne({
      where: { id },
      relations: ['medicine'],
    });
    if (!entity) throw new NotFoundException('User medication not found');

    if (entity.userId !== userId) {
      throw new NotFoundException('User medication not found');
    }

    let medicineId = entity.medicineId;

    if (dto.medicineName) {
      const trimmedName = dto.medicineName.trim();
      let medicine = await this.medicineRepository.findOne({
        where: [
          { brandName: trimmedName },
          { genericName: trimmedName },
        ],
      });

      if (!medicine) {
        medicine = await this.medicineRepository.save(
          this.medicineRepository.create({
            brandName: trimmedName,
            genericName: trimmedName,
          }),
        );
      }
      medicineId = medicine.id;
    } else if (dto.medicineId) {
      const medicine = await this.medicineRepository.findOneBy({
        id: dto.medicineId,
      });
      if (!medicine) throw new NotFoundException('Medicine not found');
      medicineId = dto.medicineId;
    }

    const updatePayload: Partial<UserMedication> = {
      medicineId,
    };

    if (dto.frequency) updatePayload.frequency = dto.frequency;
    if (dto.dosageType) updatePayload.dosageType = dto.dosageType;
    if (dto.morningDosage !== undefined)
      updatePayload.morningDosage = dto.morningDosage;
    if (dto.afternoonDosage !== undefined)
      updatePayload.afternoonDosage = dto.afternoonDosage;
    if (dto.eveningDosage !== undefined)
      updatePayload.eveningDosage = dto.eveningDosage;
    if (dto.nightDosage !== undefined)
      updatePayload.nightDosage = dto.nightDosage;
    if (dto.durationValue !== undefined)
      updatePayload.durationValue = dto.durationValue;
    if (dto.durationUnit) updatePayload.durationUnit = dto.durationUnit;
    if (dto.instruction) updatePayload.instruction = dto.instruction;
    if (dto.customInstruction !== undefined)
      updatePayload.customInstruction = dto.customInstruction;
    if (dto.startDate) updatePayload.startDate = new Date(dto.startDate);
    if (typeof dto.isActive === 'boolean') updatePayload.isActive = dto.isActive;

    await this.userMedicationRepository.update(id, updatePayload);

    const updated = await this.userMedicationRepository.findOne({
      where: { id },
      relations: ['medicine'],
    });

    return updated as UserMedication;
  }

  /**
   * Soft-delete / deactivate a user medication plan.
   */
  async removeUserMedication(id: string, userId: string): Promise<void> {
    const entity = await this.userMedicationRepository.findOneBy({ id });
    if (!entity) throw new NotFoundException('User medication not found');
    if (entity.userId !== userId)
      throw new NotFoundException('User medication not found');
    await this.userMedicationRepository.delete(id);
  }

  /**
   * Log a medication intake for a user's medication plan.
   * Verifies the user owns the plan before creating the log entry.
   */
  async logMedication(
    userId: string,
    userMedicationId: string,
    dto: any,
  ): Promise<MedicationLog> {
    // ensure user medication exists and belongs to the user
    const plan = await this.userMedicationRepository.findOneBy({
      id: userMedicationId,
    });
    if (!plan) throw new NotFoundException('User medication plan not found');
    if (plan.userId !== userId)
      throw new BadRequestException(
        'Not authorized to log for this medication plan',
      );

    // create log entry
    const log = this.medicationLogRepository.create({
      userMedication: plan,
      logDate: new Date(dto.logDate),
      timeTaken: new Date(dto.timeTaken),
      doseTimeOfDay: dto.doseTimeOfDay,
      dosageTaken: dto.dosageTaken,
      wasTaken: typeof dto.wasTaken === 'boolean' ? dto.wasTaken : true,
      notes: dto.notes,
    } as Partial<MedicationLog>);

    return this.medicationLogRepository.save(log);
  }

  /**
   * For a given user and date, return all medication plans that are active on that date
   * and include any logs for that date. The response is grouped by time of day and
   * uses the exact keys you requested: { moning, afternoon, evening, niggt }.
   */
  async getMedicationsForDate(userId: string, date: string | Date) {
    const target = this.parseToDate(date);
    const dateStr = this.toDateString(target);

    // Fetch active plans using query builder with date filtering at DB level
    const plans = await this.userMedicationRepository
      .createQueryBuilder('plan')
      .where('plan.userId = :userId', { userId })
      .andWhere('plan.isActive = :isActive', { isActive: true })
      .andWhere('DATE(plan.startDate) <= :dateStr', { dateStr })
      .getMany();

    // Filter plans by duration (this still needs in-memory check for end date calculation)
    const activePlans = plans.filter((p) => this.isPlanActiveOnDate(p, target, dateStr));

    if (activePlans.length === 0) {
      return { moning: [], afternoon: [], evening: [], niggt: [] };
    }

    const planIds = activePlans.map((p) => p.id);

    // Load logs for these plans on the given date, selecting the foreign key directly
    const logs = await this.medicationLogRepository
      .createQueryBuilder('log')
      .leftJoin('log.userMedication', 'plan')
      .addSelect('plan.id')
      .where('plan.id IN (:...ids)', { ids: planIds })
      .andWhere('log.logDate = :dateStr', { dateStr })
      .getMany();

    // Build log lookup map: planId::doseTimeOfDay -> logs[]
    const logsByPlanAndTime = new Map<string, MedicationLog[]>();
    for (const log of logs) {
      const planId = (log.userMedication as any)?.id ?? '';
      if (!planId) continue;
      const key = `${planId}::${log.doseTimeOfDay}`;
      const existing = logsByPlanAndTime.get(key);
      if (existing) {
        existing.push(log);
      } else {
        logsByPlanAndTime.set(key, [log]);
      }
    }

    // Build result grouped by time of day
    const result: {
      moning: { plan: UserMedication; logs: MedicationLog[] }[];
      afternoon: { plan: UserMedication; logs: MedicationLog[] }[];
      evening: { plan: UserMedication; logs: MedicationLog[] }[];
      niggt: { plan: UserMedication; logs: MedicationLog[] }[];
    } = { moning: [], afternoon: [], evening: [], niggt: [] };

    const timeSlots = [
      { key: 'moning' as const, dose: DoseTimeOfDay.MORNING },
      { key: 'afternoon' as const, dose: DoseTimeOfDay.AFTERNOON },
      { key: 'evening' as const, dose: DoseTimeOfDay.EVENING },
      { key: 'niggt' as const, dose: DoseTimeOfDay.NIGHT },
    ];

    for (const plan of activePlans) {
      const pid = plan.id;

      for (const { key, dose } of timeSlots) {
        const logsArr = logsByPlanAndTime.get(`${pid}::${dose}`) ?? [];
        result[key].push({ plan, logs: logsArr });
      }

      // Include AS_NEEDED logs under 'moning' as catch-all
      const asNeededLogs = logsByPlanAndTime.get(`${pid}::${DoseTimeOfDay.AS_NEEDED}`);
      if (asNeededLogs?.length) {
        result.moning.push({ plan, logs: asNeededLogs });
      }
    }

    return result;
  }

  /**
   * Convert date to YYYY-MM-DD string format
   */
  private toDateString(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  private parseToDate(d: string | Date): Date {
    if (d instanceof Date) return d;
    const parsed = new Date(d);
    if (isNaN(parsed.getTime())) throw new BadRequestException('Invalid date');
    return parsed;
  }

  /**
   * Check if a medication plan is active on the target date based on start date and duration.
   * @param plan - The medication plan to check
   * @param target - The target date
   * @param targetDateStr - Pre-computed date string (YYYY-MM-DD) to avoid redundant conversion
   */
  private isPlanActiveOnDate(
    plan: UserMedication,
    target: Date,
    targetDateStr?: string,
  ): boolean {
    const start = new Date(plan.startDate as any);
    if (isNaN(start.getTime())) return false;

    const durationUnit = String(plan.durationUnit).toLowerCase();

    // Lifelong plans are always active
    if (durationUnit === 'lifelong') return true;

    const startStr = this.toDateString(start);
    const tStr = targetDateStr ?? this.toDateString(target);

    // Target date must be on or after start date
    if (tStr < startStr) return false;

    // Compute end date based on duration
    const durationValue = Number(plan.durationValue) || 0;
    const end = new Date(start.getTime());

    switch (durationUnit) {
      case 'days':
        end.setDate(end.getDate() + durationValue);
        break;
      case 'weeks':
        end.setDate(end.getDate() + durationValue * 7);
        break;
      case 'months':
        end.setMonth(end.getMonth() + durationValue);
        break;
      default:
        // Unknown duration unit, assume active
        return true;
    }

    const endStr = this.toDateString(end);
    return tStr <= endStr;
  }
}
