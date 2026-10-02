import { Module } from '@nestjs/common';
import { MedicineService } from './medicine.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimpleMedicine } from './entity/medicine.entity';

@Module({
  providers: [MedicineService],
  exports: [MedicineService],
  imports: [TypeOrmModule.forFeature([SimpleMedicine])],
})
export class MedicineModule {}
