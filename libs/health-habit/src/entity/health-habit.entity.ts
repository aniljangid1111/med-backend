import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TestComponent } from './test-components.entity';

@Entity('health_habits')
export class HealthHabit {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column('text', { nullable: true })
  icon: string | null;

  @Column({ type: 'text', nullable: true })
  bgImage: string | null;

  @Column({ type: 'text', nullable: true })
  color: string | null;

  @Column('boolean', { default: false })
  isActive: boolean;

  @Column('varchar', { length: 255 })
  @Index()
  type: 'health' | 'habit';

  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId: string | null;

  @Column({ type: 'boolean', default: false })
  isCustom: boolean;

  @OneToMany(() => TestComponent, (component) => component.habit)
  components: TestComponent[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
