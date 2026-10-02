import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('reset_codes')
export class ResetCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  @Index('idx_reset_code_email')
  email: string;

  @Column('varchar')
  code: string;

  @Column('timestamp')
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
