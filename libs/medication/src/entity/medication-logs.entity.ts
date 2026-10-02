import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { UserMedication } from './user-medication.enity';

/**
 * Enum to specify the time of day a dose was taken.
 */
export enum DoseTimeOfDay {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  NIGHT = 'night',
  AS_NEEDED = 'as_needed',
}

/**
 * Represents a log entry for a single dose of medication taken by a user.
 * Each entry is linked to a specific UserMedication plan.
 */
@Entity('medication_logs')
@Index(['userMedication', 'logDate'])
export class MedicationLog {
  /**
   * The unique identifier for the medication log entry.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // now create a nestjs servce class in which give me all user madication for if user is taken a medecin also include that and the function should return
  /**
   * The specific medication plan this log entry belongs to.
   * Establishes a many-to-one relationship with the UserMedication entity.
   */
  @ManyToOne(() => UserMedication, (userMed) => userMed.id, {
    onDelete: 'CASCADE',
  })
  userMedication: UserMedication;

  /**
   * The date for which this medication intake is being logged.
   */
  @Column({ type: 'date' })
  logDate: Date;

  /**
   * The exact time the medication was taken.
   */
  @Column({ type: 'timestamp with time zone' })
  timeTaken: Date;

  /**
   * Specifies which scheduled dose this log refers to (e.g., 'morning').
   */
  @Column({
    type: 'enum',
    enum: DoseTimeOfDay,
  })
  doseTimeOfDay: DoseTimeOfDay;

  /**
   * The actual dosage amount that was taken. This can be used to confirm
   * adherence to the prescribed amount in the UserMedication plan.
   */
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  dosageTaken: number;

  /**
   * A simple flag to confirm the medication was taken.
   * While the existence of a log implies it was taken, this adds explicit confirmation.
   */
  @Column({ type: 'boolean', default: true })
  wasTaken: boolean;

  /**
   * Optional notes from the user for this specific dose,
   * such as side effects or other observations.
   */
  @Column({ type: 'text', nullable: true })
  notes: string;

  /**
   * The timestamp when this log entry was created.
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * The timestamp when this log entry was last updated.
   */
  @UpdateDateColumn()
  updatedAt: Date;
}
