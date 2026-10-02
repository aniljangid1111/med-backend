import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Medicine } from './medicine.entity';
import { User } from '@user/user/enitity/user.entity';

/**
 * Enum for the frequency of medication intake.
 */
export enum MedicationFrequency {
  AS_NEEDED = 'as_needed',
  EVERY_HOUR = 'every_hour',
  EVERY_4_HOURS = 'every_4_hours',
  EVERY_6_HOURS = 'every_6_hours',
  ONCE_A_DAY = 'once_a_day',
  TWICE_A_DAY = 'twice_a_day',
  THRICE_A_DAY = 'thrice_a_day',
  FOUR_TIMES_A_DAY = 'four_times_a_day',
  EVERY_OTHER_DAY = 'every_other_day',
  ONCE_A_WEEK = 'once_a_week',
}

/**
 * Enum for the type or form of the medication.
 */
export enum MedicationDosageType {
  TABLET = 'tablet',
  CAPSULE = 'capsule',
  LIQUID = 'liquid',
  INJECTION = 'injection',
  CREAM = 'cream',
  LOTION = 'lotion',
  DROPS = 'drops',
  INHALER = 'inhaler',
  OTHER = 'other',
}

/**
 * Enum for the unit of duration for the medication course.
 */
export enum MedicationDurationUnit {
  DAYS = 'days',
  WEEKS = 'weeks',
  MONTHS = 'months',
  LIFELONG = 'lifelong',
}

/**
 * Enum for specific instructions related to food.
 */
export enum MedicationInstruction {
  BEFORE_FOOD = 'before_food',
  WITH_FOOD = 'with_food',
  AFTER_FOOD = 'after_food',
  NO_SPECIFIC_INSTRUCTION = 'no_specific_instruction',
  CUSTOM = 'custom',
}

/**
 * Represents a user's specific medication plan.
 * This entity links a user to a medicine and details the prescribed
 * dosage, schedule, and instructions.
 */
@Entity('user_medications')
@Index(['user', 'medicine'])
export class UserMedication {
  /**
   * The unique identifier for the user's medication record.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The user who is prescribed this medication.
   * Establishes a many-to-one relationship with the User entity.
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  userId: string;

  /**
   * The medicine that has been selected for the user.
   * Establishes a many-to-one relationship with the Medicine entity.
   */
  @ManyToOne(() => Medicine, { eager: true })
  @JoinColumn({ name: 'medicineId' })
  medicine: Medicine;

  @Column('uuid')
  medicineId: string;

  /**
   * The frequency of medication intake (e.g., 'twice_a_day').
   */
  @Column({
    type: 'enum',
    enum: MedicationFrequency,
    default: MedicationFrequency.ONCE_A_DAY,
  })
  frequency: MedicationFrequency;

  /**
   * The physical form of the medicine (e.g., 'tablet').
   */
  @Column({
    type: 'enum',
    enum: MedicationDosageType,
    default: MedicationDosageType.TABLET,
  })
  dosageType: MedicationDosageType;

  // --- Time of Day Dosage ---
  /**
   * Number of units to take in the morning.
   * Use decimal for cases like half a tablet (0.5).
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  morningDosage: number;

  /**
   * Number of units to take in the afternoon.
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  afternoonDosage: number;

  /**
   * Number of units to take in the evening.
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  eveningDosage: number;

  /**
   * Number of units to take at night/bedtime.
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  nightDosage: number;

  // --- Duration of Medication Course ---
  /**
   * The numerical value for the duration (e.g., 14).
   */
  @Column({ type: 'int' })
  durationValue: number;

  /**
   * The unit for the duration (e.g., 'days').
   */
  @Column({
    type: 'enum',
    enum: MedicationDurationUnit,
    default: MedicationDurationUnit.DAYS,
  })
  durationUnit: MedicationDurationUnit;

  // --- Instructions ---
  /**
   * General instruction regarding food.
   */
  @Column({
    type: 'enum',
    enum: MedicationInstruction,
    default: MedicationInstruction.NO_SPECIFIC_INSTRUCTION,
  })
  instruction: MedicationInstruction;

  /**
   * A field for custom instructions, used when the 'instruction'
   * field is set to 'CUSTOM'.
   */
  @Column({ type: 'text', nullable: true })
  customInstruction: string;

  /**
   * The date the user should start taking the medication.
   */
  @Column({ type: 'date' })
  startDate: Date;

  /**
   * Indicates if this medication plan is currently active.
   */
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /**
   * The timestamp when this record was created.
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * The timestamp when this record was last updated.
   */
  @UpdateDateColumn()
  updatedAt: Date;
}
