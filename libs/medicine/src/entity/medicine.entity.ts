import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('simple_medicines')
export class SimpleMedicine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { unique: true })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('jsonb', { nullable: true })
  ingredients: string[];

  @Column('varchar', { nullable: true })
  imageUrl: string | null;

  @Column('boolean', { default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
