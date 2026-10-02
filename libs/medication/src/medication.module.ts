import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicationService } from './medication.service';
import { UserMedicationService } from './user-medication.service';
import { Medicine } from './entity/medicine.entity';
import { UserMedication } from './entity/user-medication.enity';
import { MedicationLog } from './entity/medication-logs.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medicine, UserMedication, MedicationLog]),
  ],
  providers: [MedicationService, UserMedicationService],
  exports: [MedicationService, UserMedicationService],
})
export class MedicationModule {}
