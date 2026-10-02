import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tests')
export class TestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { unique: true })
  name: string;

  @Column('text', { nullable: true })
  description: string | null;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any> | null;

  @Column('jsonb', { nullable: true })
  options: Record<string, any> | null;

  @Column('boolean', { default: false })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
