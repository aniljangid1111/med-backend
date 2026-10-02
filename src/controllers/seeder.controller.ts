import { Controller, Post } from '@nestjs/common';
import { Public } from '@auth/auth/decorator/public.decorator';
import { SeederService } from '@app/seeder';

@Controller('seeder')
export class SeederController {
  constructor(private readonly seederService: SeederService) {}

  @Public()
  @Post('seed-all')
  async seedAll() {
    return this.seederService.seedAll();
  }

  @Public()
  @Post('seed-users')
  async seedUsers() {
    return this.seederService.seedUsers();
  }

  @Public()
  @Post('seed-allergies')
  async seedAllergies() {
    return this.seederService.seedAllergies();
  }

  @Public()
  @Post('seed-health-conditions')
  async seedHealthConditions() {
    return this.seederService.seedHealthConditions();
  }

  @Public()
  @Post('seed-health-habits')
  async seedHealthHabits() {
    return this.seederService.seedHealthHabits();
  }

  @Public()
  @Post('seed-medicines')
  async seedMedicines() {
    return this.seederService.seedMedicines();
  }

  @Public()
  @Post('seed-medications')
  async seedMedications() {
    return this.seederService.seedMedications();
  }

  @Public()
  @Post('seed-user-health-habits')
  async seedUserHealthHabits() {
    return this.seederService.seedUserHealthHabits();
  }

  @Public()
  @Post('seed-tests')
  async seedTests() {
    return this.seederService.seedTests();
  }
}
