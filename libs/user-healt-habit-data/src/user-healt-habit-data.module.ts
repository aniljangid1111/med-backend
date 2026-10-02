import { Module } from '@nestjs/common';
import { UserHealtHabitDataService } from './user-healt-habit-data.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserHealthHabitData } from './entity/user-healt-habit-data.entity';
import { UserHealtHabitReportService } from './user-healt-report.service';

@Module({
  providers: [UserHealtHabitDataService, UserHealtHabitReportService],
  exports: [UserHealtHabitDataService, UserHealtHabitReportService],
  imports: [TypeOrmModule.forFeature([UserHealthHabitData])],
})
export class UserHealtHabitDataModule {}
