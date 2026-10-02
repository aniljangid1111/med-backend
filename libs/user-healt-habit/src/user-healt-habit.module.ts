import { Module } from '@nestjs/common';
import { UserHealtHabitService } from './user-healt-habit.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserHealthHabit } from './entitiy/user-healt-habit.entity';

@Module({
  providers: [UserHealtHabitService],
  exports: [UserHealtHabitService],
  imports: [TypeOrmModule.forFeature([UserHealthHabit])],
})
export class UserHealtHabitModule {}
