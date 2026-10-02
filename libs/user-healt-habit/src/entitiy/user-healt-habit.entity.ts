import { HealthHabit } from '@healthheabit/health-habit/entity/health-habit.entity';
import { User } from '@user/user/enitity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_health_habits')
export class UserHealthHabit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => HealthHabit)
  @JoinColumn({ name: 'healthHabitId' })
  healthHabit: HealthHabit;

  @Column('bigint', { unsigned: true })
  healthHabitId: string;

  @Column('bool')
  @Index()
  isFavorite: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
