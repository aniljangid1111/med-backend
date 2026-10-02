import { Module } from '@nestjs/common';
import { HealthHabitService } from './health-habit.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthHabit } from './entity/health-habit.entity';
import { LabUnitReference } from './entity/lab-unit-reference.entity';
import { TestComponent } from './entity/test-components.entity';

@Module({
  providers: [HealthHabitService],
  exports: [HealthHabitService],
  imports: [
    TypeOrmModule.forFeature([HealthHabit, LabUnitReference, TestComponent]),
  ],
})
export class HealthHabitModule {}
