import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The user who added this doctor (if user-specific).
   * Nullable for global/admin-added doctors.
   */
  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  doctorName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  speciality: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  mobileNumber: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'integer', default: 0 })
  numberOfVisits: number;

  @Column({ type: 'boolean', default: false })
  isFavorite: boolean;

  @Column({ type: 'boolean', default: false })
  remindInWeek: boolean;

  @Column({ type: 'boolean', default: false })
  isFamilyDoctor: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
