import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Represents a medicine in the database.
 * This entity stores detailed information about each medication,
 * including its brand and generic names, chemical composition,
 * manufacturer, and other relevant properties.
 */
@Entity('medicines')
export class Medicine {
  /**
   * The unique identifier for the medicine.
   * Uses a UUID for global uniqueness.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The commercial or brand name of the medicine.
   * e.g., "Tylenol", "Advil"
   */
  @Index()
  @Column({ type: 'varchar', length: 255 })
  brandName: string;

  /**
   * The official, non-proprietary or generic name of the medicine.
   * e.g., "Paracetamol", "Ibuprofen"
   */
  @Index()
  @Column({ type: 'varchar', length: 255 })
  genericName: string;

  /**
   * A list of active chemical ingredients in the medicine.
   * Stored as a simple array of strings for easy querying.
   * e.g., ["Acetaminophen", "Caffeine"]
   */
  @Column({ type: 'simple-array', nullable: true })
  activeIngredients: string[];

  /**
   * The company that manufactures the medicine.
   * e.g., "Pfizer", "Johnson & Johnson"
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  manufacturer: string;

  /**
   * The form in which the medicine is administered.
   * e.g., "Tablet", "Capsule", "Syrup", "Injection"
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  dosageForm: string;

  /**
   * The strength or concentration of the active ingredient(s).
   * e.g., "500mg", "10mg/5ml"
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  strength: string;

  /**
   * The pharmacological class or category the drug belongs to.
   * e.g., "Analgesic", "Antibiotic", "Antihypertensive"
   */
  @Column({ type: 'varchar', length: 150, nullable: true })
  drugClass: string;

  /**
   * A brief description of the medicine's purpose and use.
   */
  @Column({ type: 'text', nullable: true })
  description: string;

  /**
   * Indicates whether a prescription is required to purchase this medicine.
   */
  @Column({ type: 'boolean', default: true })
  isPrescriptionRequired: boolean;

  /**
   * The timestamp when this medicine record was created.
   * Automatically set by the database.
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * The timestamp when this medicine record was last updated.
   * Automatically set by the database on update.
   */
  @UpdateDateColumn()
  updatedAt: Date;
}
