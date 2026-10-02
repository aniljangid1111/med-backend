import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TestComponent } from './test-components.entity';

@Entity('lab_unit_references')
export class LabUnitReference {
  // Primary key, automatically generated.
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // The unit of measurement (e.g., 'g/dL', 'mmol/L', 'mmHg', or 'Ratio' for N:L).
  @Column({ type: 'varchar', length: 50, nullable: false })
  unit: string;

  // Numeric lower bound of the normal range for THIS specific unit.
  @Column({ type: 'numeric', nullable: true })
  normalRangeMin: number | null;

  // Numeric upper bound of the normal range for THIS specific unit.
  @Column({ type: 'numeric', nullable: true })
  normalRangeMax: number | null;

  // The formula or factor needed to convert this unit to the primary unit (if applicable).
  @Column({ type: 'varchar', length: 255, nullable: true })
  conversionFactor: string | null;

  // Foreign Key: Links back to the component definition.
  @ManyToOne(() => TestComponent, (component) => component.unitReferences, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'component_id' })
  component: TestComponent;

  // Column to store the foreign key ID explicitly
  @Column({ type: 'uuid', nullable: false })
  componentId: string;
}
