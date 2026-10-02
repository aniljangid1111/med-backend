import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Allergy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('varchar', { nullable: true })
  category: string; // e.g., 'food', 'medication', 'environmental', 'insect', 'latex', 'other'

  @Column('varchar', { nullable: true })
  allergenType: string; // e.g., 'pollen', 'dust', 'animal dander', 'specific food item'

  @Column('text', { nullable: true })
  commonSymptoms: string | null; // Common symptoms associated with this allergy

  @Column('varchar', { nullable: true })
  severity: string | null; // e.g., 'mild', 'moderate', 'severe', 'life-threatening'

  @Column('text', { nullable: true })
  crossReactivity: string | null; // Related allergens that might cause similar reactions

  @Column('text', { nullable: true })
  avoidanceAdvice: string | null; // Tips on how to avoid this allergen

  @Column('boolean', { default: false })
  requiresEpiPen: boolean; // Indicates if epinephrine auto-injector might be needed

  @Column('text', { nullable: true })
  emergencyInfo: string; // Emergency information or instructions

  @Column('boolean', { default: false })
  isActive: boolean;

  @CreateDateColumn({ type: 'time with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'time with time zone' })
  updatedAt: Date;
}
