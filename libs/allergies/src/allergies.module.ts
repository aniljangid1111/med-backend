import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllergiesService } from './allergies.service';
import { Allergy } from './entities/allergy.entity';
import { UserAllergy } from './entities/user-allergy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Allergy, UserAllergy])],
  providers: [AllergiesService],
  exports: [AllergiesService],
})
export class AllergiesModule {}
