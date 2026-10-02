import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HealthHabit } from './health-habit.entity';
import { LabUnitReference } from './lab-unit-reference.entity';

@Entity('test_components')
export class TestComponent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // The specific component name (e.g., 'fasting', 'Neutrophils', 'N:L ratio').
  @Column({ type: 'varchar', length: 255, nullable: false })
  componentName: string;

  // Defines the type of expected result.
  // 'QUANTITATIVE': Numeric result (uses LabUnitReference for ranges).
  // 'QUALITATIVE': Binary or discrete non-numeric result (e.g., 'Positive'/'Negative').
  // 'TEXTUAL': Descriptive result (e.g., 'Blood Group: A+').
  // 'CALCULATED': Result derived from other component values (requires calculationFormula).
  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
    default: 'QUANTITATIVE',
  })
  resultType: 'QUANTITATIVE' | 'QUALITATIVE' | 'TEXTUAL' | 'CALCULATED';

  // NEW FIELD: Stores the formula if resultType is 'CALCULATED'.
  // Example: "component:Neutrophils / component:Lymphocytes" or "(component:HDL / component:Triglycerides)".
  @Column({ type: 'varchar', length: 500, nullable: true })
  calculationFormula: string | null;

  // The *primary* normal range or expected value stored as text.
  @Column({ type: 'text', nullable: false })
  normalRangeText: string;

  // Optional: A column to describe any critical factors influencing the range (e.g., 'Gender: Male', 'Fasting required').
  @Column({ type: 'varchar', length: 100, nullable: true })
  contextFactors: string | null;

  // Relation: One component can have multiple unit/range definitions (e.g., mg/dl and mmol/L).
  @OneToMany(() => LabUnitReference, (unitRef) => unitRef.component)
  unitReferences: LabUnitReference[];

  // Foreign Key: Links this component back to its main HealthHabit.
  @ManyToOne(() => HealthHabit, (habit) => habit.components, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'health_habit_id' })
  habit: HealthHabit;

  // Column to store the foreign key ID explicitly
  @Column({ type: 'integer', nullable: false })
  labTestId: number;
}
