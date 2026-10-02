import { HealthHabit } from '@healthheabit/health-habit/entity/health-habit.entity';
import { TestComponent } from '@healthheabit/health-habit/entity/test-components.entity';
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

@Entity('user_health_habit_data')
export class UserHealthHabitData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => HealthHabit, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'healthHabitId' })
  healthHabit: HealthHabit;

  @Index('idx_user_health_habit_data_health_habit_id')
  @Column({ type: 'int' })
  healthHabitId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index('idx_user_health_habit_data_user_id')
  @Column('uuid')
  userId: string;

  @Column('timestamp with time zone')
  @Index('idx_user_health_habit_data_date')
  date: Date;

  @Column({ type: 'varchar', length: 500, nullable: false })
  resultValue: string;

  // Optional: If the result is quantitative or calculated, store the numeric value separately for easier comparison.
  @Column({
    type: 'numeric',
    nullable: true,
    transformer: {
      to: (value: number | null) => value ?? null,
      from: (value: string | null) => (value !== null ? Number(value) : null),
    },
  })
  numericResult: number | null;

  // The date and time the sample was collected or the result was recorded.
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  reportedAt: Date;

  // NEW FIELD: Explicitly stores the unit for this specific result (e.g., 'mg/dL' or 'Ratio').
  // This is critical when a component can be reported in multiple units.
  @Column({ type: 'varchar', length: 50, nullable: true })
  unitUsed: string | null;

  // NEW FIELD: Any additional notes or context from the lab or the clinician for this specific result.
  // E.g., "Patient was noted to be non-fasting", "Sample clotted during collection."
  @Column({ type: 'text', nullable: true })
  contextNote: string | null;

  // Foreign Key: Links to the structural definition of the test component
  // (e.g., 'Hemoglobin', which defines the unit, normal range, and potential formula).
  @ManyToOne(() => TestComponent, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'componentDefinitionId' })
  componentDefinition: TestComponent;

  @Column({ type: 'uuid', nullable: false })
  componentDefinitionId: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
