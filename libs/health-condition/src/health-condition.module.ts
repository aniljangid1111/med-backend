import { Module } from '@nestjs/common';
import { HealthConditionService } from './health-condition.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthCondition } from './entities/health-condition.entity';
import { UserHealthCondition } from './entities/user-health-condition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HealthCondition, UserHealthCondition])],
  providers: [HealthConditionService],
  exports: [HealthConditionService],
})
export class HealthConditionModule {}
