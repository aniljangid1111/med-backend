import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthGoalService } from './health-goal.service';
import { HealthGoal } from './entities/health-goal.entity';
import { UserHealthGoal } from './entities/user-health-goal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HealthGoal, UserHealthGoal])],
  providers: [HealthGoalService],
  exports: [HealthGoalService],
})
export class HealthGoalModule { }
