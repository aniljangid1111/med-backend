import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Allergy } from '@app/allergies/entities/allergy.entity';
import { UserAllergy } from '@app/allergies/entities/user-allergy.entity';
import { HealthCondition } from '@app/health-condition/entities/health-condition.entity';
import { UserHealthCondition } from '@app/health-condition/entities/user-health-condition.entity';
import { HealthHabit } from '@healthheabit/health-habit/entity/health-habit.entity';
import { LabUnitReference } from '@healthheabit/health-habit/entity/lab-unit-reference.entity';
import { TestComponent } from '@healthheabit/health-habit/entity/test-components.entity';
import { Medicine as MedicationMedicine } from '@app/medication/entity/medicine.entity';
import { UserMedication } from '@app/medication/entity/user-medication.enity';
import { MedicationLog } from '@app/medication/entity/medication-logs.entity';
import { SimpleMedicine } from '@medicine/medicine/entity/medicine.entity';
import { TestEntity } from '@tests/test/entity/test.entity';
import { User } from '@user/user/enitity/user.entity';
import { UserHealthHabit } from '@user-healt-habit/user-healt-habit/entitiy/user-healt-habit.entity';
import { UserHealthHabitData } from '@user-healt-habit-data/user-healt-habit-data/entity/user-healt-habit-data.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Allergy,
      UserAllergy,
      HealthCondition,
      UserHealthCondition,
      HealthHabit,
      TestComponent,
      LabUnitReference,
      MedicationMedicine,
      UserMedication,
      MedicationLog,
      SimpleMedicine,
      TestEntity,
      UserHealthHabit,
      UserHealthHabitData,
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
