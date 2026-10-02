import { AllergiesModule } from '@app/allergies';
import { AuthModule } from '@auth/auth';
import { HealthConditionModule } from '@app/health-condition';
import { HealthGoalModule } from '@app/health-goal';
import { HealthHabitModule } from '@healthheabit/health-habit';
import { MedicineModule } from '@medicine/medicine';
import { MedicationModule } from '@app/medication';
import { Module } from '@nestjs/common';
import { NotificationModule } from '@notification/notification';
import { DoctorModule } from '@doctor/doctor';
import { SeederModule } from '@app/seeder';
import { UserHealtHabitDataModule } from '@user-healt-habit-data/user-healt-habit-data';
import { UserHealtHabitModule } from '@user-healt-habit/user-healt-habit';
import { UserModule } from '@user/user';
import { BlogModule } from '@blog/blog';
import { FaqModule } from '@faq/faq';
import { AllergiesController } from './allergies.controller';
import { AuthController } from './auth.controller';
import { BlogController } from './blog.controller';
import { FaqController } from './faq.controller';
import { DoctorController } from './doctor.controller';
import { DashboardController } from './dashboard.controller';
import { HabitControllerTsController } from './reports/habit.controller';
import { HealthConditionsController } from './health-conditions.controller';
import { HealthGoalController } from './health-goal.controller';
import { HealthHabitsController } from './health-habits.controller';
import { MedicineController } from './medicine.controller';
import { SeederController } from './seeder.controller';
import { UserMedicationController } from './user-medication.controller';
import { UsersController } from './users.controller';
import { UserHealthHabitsDataController } from './user-health-habits-data.controller';

@Module({
  controllers: [
    AuthController,
    UsersController,
    MedicineController,
    DoctorController,
    UserMedicationController,
    HabitControllerTsController,
    HealthHabitsController,
    DashboardController,
    HealthConditionsController,
    HealthGoalController,
    AllergiesController,
    SeederController,
    UserHealthHabitsDataController,
    BlogController,
    FaqController,
  ],
  imports: [
    AuthModule,
    UserModule,
    HealthHabitModule,
    UserHealtHabitModule,
    UserHealtHabitDataModule,
    MedicineModule,
    MedicationModule,
    DoctorModule,
    NotificationModule,
    HealthConditionModule,
    HealthGoalModule,
    AllergiesModule,
    SeederModule,
    BlogModule,
    FaqModule,
  ],
})
export class ControllersModule { }
