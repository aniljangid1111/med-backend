import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SimpleMedicine } from './entity/medicine.entity';
import { Repository } from 'typeorm';
import { CreateMedicineDto } from './dtos/create-medicine.dto';

@Injectable()
export class MedicineService {
  constructor(
    @InjectRepository(SimpleMedicine)
    private readonly medicineRepository: Repository<SimpleMedicine>,
  ) {}

  async createMedicine(
    createMedicineDto: CreateMedicineDto,
    image?: string,
  ): Promise<SimpleMedicine> {
    const medicine = this.medicineRepository.create(createMedicineDto);
    if (image) {
      medicine.imageUrl = image;
    }
    return this.medicineRepository.save(medicine);
  }

  async findAll(search?: string): Promise<SimpleMedicine[]> {
    if (search) {
      return this.medicineRepository
        .createQueryBuilder('medicine')
        .where('medicine.isActive = :isActive', { isActive: true })
        .andWhere(
          '(LOWER(medicine.name) LIKE LOWER(:search) OR LOWER(medicine.description) LIKE LOWER(:search))',
          { search: `%${search}%` },
        )
        .getMany();
    }
    return this.medicineRepository.findBy({ isActive: true });
  }

  async findOne(id: number): Promise<SimpleMedicine> {
    const medicine = await this.medicineRepository.findOneBy({
      id,
      isActive: true,
    });
    if (!medicine) {
      throw new NotFoundException();
    }
    return medicine;
  }

  async updateMedicine(
    id: number,
    updateMedicineDto: CreateMedicineDto,
    image?: string,
  ): Promise<SimpleMedicine> {
    const medicine = await this.findOne(id);
    Object.assign(medicine, updateMedicineDto);
    if (image) {
      medicine.imageUrl = image;
    }
    return this.medicineRepository.save(medicine);
  }

  async delete(id: number): Promise<void> {
    const medicine = await this.findOne(id);
    await this.medicineRepository.delete(medicine.id);
  }
}
