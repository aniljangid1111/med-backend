import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BloodGroup } from '../enums/blood-group.enum';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { unique: true })
  email: string;

  @Column('varchar', { default: '' })
  password: string;

  @Column('varchar', { unique: true, nullable: true })
  @Index('idx_user_firebase_uid')
  firebaseUid: string | null;

  @Column('varchar', { default: '', nullable: true })
  name: string | null;

  @Column('varchar', { default: '', nullable: true })
  gender: string | null;

  @Column('date', { nullable: true })
  dateOfBirth: Date | null;

  @Column('varchar', { name: 'blood_group', nullable: true })
  bloodGroup: BloodGroup | string | null;

  @Column('boolean', { default: false })
  @Index('idx_user_email_verified')
  isEmailVerified: boolean;

  @Column('numeric', { nullable: true, precision: 10, scale: 2 })
  weight: number | null;

  @Column('numeric', { nullable: true, precision: 10, scale: 2 })
  height: number | null;

  @Column('time', {
    nullable: true,
    default: () => 'CURRENT_TIME',
  })
  alertTime: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  @Index('idx_user_created_at')
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  @Index('idx_user_deleted_at')
  deletedAt: Date | null;
}
