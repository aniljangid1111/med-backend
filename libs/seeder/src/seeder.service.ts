import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Allergy } from '@app/allergies/entities/allergy.entity';
import { UserAllergy } from '@app/allergies/entities/user-allergy.entity';
import { HealthCondition } from '@app/health-condition/entities/health-condition.entity';
import { UserHealthCondition } from '@app/health-condition/entities/user-health-condition.entity';
import { HealthHabit } from '@healthheabit/health-habit/entity/health-habit.entity';
import { LabUnitReference } from '@healthheabit/health-habit/entity/lab-unit-reference.entity';
import { TestComponent } from '@healthheabit/health-habit/entity/test-components.entity';
import { Medicine as MedicationMedicine } from '@app/medication/entity/medicine.entity';
import {
  MedicationLog,
  DoseTimeOfDay,
} from '@app/medication/entity/medication-logs.entity';
import {
  UserMedication,
  MedicationFrequency,
  MedicationDosageType,
  MedicationDurationUnit,
  MedicationInstruction,
} from '@app/medication/entity/user-medication.enity';
import { SimpleMedicine } from '@medicine/medicine/entity/medicine.entity';
import { TestEntity } from '@tests/test/entity/test.entity';
import { User } from '@user/user/enitity/user.entity';
import { UserHealthHabit } from '@user-healt-habit/user-healt-habit/entitiy/user-healt-habit.entity';
import { UserHealthHabitData } from '@user-healt-habit-data/user-healt-habit-data/entity/user-healt-habit-data.entity';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Allergy)
    private readonly allergyRepository: Repository<Allergy>,
    @InjectRepository(UserAllergy)
    private readonly userAllergyRepository: Repository<UserAllergy>,
    @InjectRepository(HealthCondition)
    private readonly healthConditionRepository: Repository<HealthCondition>,
    @InjectRepository(UserHealthCondition)
    private readonly userHealthConditionRepository: Repository<UserHealthCondition>,
    @InjectRepository(HealthHabit)
    private readonly healthHabitRepository: Repository<HealthHabit>,
    @InjectRepository(TestComponent)
    private readonly testComponentRepository: Repository<TestComponent>,
    @InjectRepository(LabUnitReference)
    private readonly labUnitReferenceRepository: Repository<LabUnitReference>,
    @InjectRepository(MedicationMedicine)
    private readonly medicationMedicineRepository: Repository<MedicationMedicine>,
    @InjectRepository(UserMedication)
    private readonly userMedicationRepository: Repository<UserMedication>,
    @InjectRepository(MedicationLog)
    private readonly medicationLogRepository: Repository<MedicationLog>,
    @InjectRepository(SimpleMedicine)
    private readonly medicineRepository: Repository<SimpleMedicine>,
    @InjectRepository(TestEntity)
    private readonly testEntityRepository: Repository<TestEntity>,
    @InjectRepository(UserHealthHabit)
    private readonly userHealthHabitRepository: Repository<UserHealthHabit>,
    @InjectRepository(UserHealthHabitData)
    private readonly userHealthHabitDataRepository: Repository<UserHealthHabitData>,
  ) {}

  async seedAll() {
    const results = {
      users: await this.seedUsers(),
      allergies: await this.seedAllergies(),
      healthConditions: await this.seedHealthConditions(),
      healthHabits: await this.seedHealthHabits(),
      medicines: await this.seedMedicines(),
      medications: await this.seedMedications(),
      userHealthHabits: await this.seedUserHealthHabits(),
      tests: await this.seedTests(),
    };
    return { success: true, message: 'All data seeded successfully', results };
  }

  async seedUsers() {
    const users = [
      {
        email: 'john.doe@example.com',
        password: '$2b$10$hashedpassword1', // This should be properly hashed
        name: 'John Doe',
        gender: 'male',
        dateOfBirth: new Date('1990-01-15'),
        isEmailVerified: true,
        weight: 75.5,
        height: 175.0,
        alertTime: new Date('1970-01-01T08:00:00'),
      },
      {
        email: 'jane.smith@example.com',
        password: '$2b$10$hashedpassword2',
        name: 'Jane Smith',
        gender: 'female',
        dateOfBirth: new Date('1985-05-20'),
        isEmailVerified: true,
        weight: 62.0,
        height: 165.0,
        alertTime: new Date('1970-01-01T07:30:00'),
      },
      {
        email: 'mike.johnson@example.com',
        password: '$2b$10$hashedpassword3',
        name: 'Mike Johnson',
        gender: 'male',
        dateOfBirth: new Date('1978-11-10'),
        isEmailVerified: false,
        weight: 85.0,
        height: 180.0,
        alertTime: new Date('1970-01-01T09:00:00'),
      },
      {
        email: 'sarah.wilson@example.com',
        password: '$2b$10$hashedpassword4',
        name: 'Sarah Wilson',
        gender: 'female',
        dateOfBirth: new Date('1992-03-25'),
        isEmailVerified: true,
        weight: 58.0,
        height: 160.0,
        alertTime: new Date('1970-01-01T06:45:00'),
      },
      {
        email: 'david.brown@example.com',
        password: '$2b$10$hashedpassword5',
        name: 'David Brown',
        gender: 'male',
        dateOfBirth: new Date('1980-07-12'),
        isEmailVerified: true,
        weight: 78.0,
        height: 172.0,
        alertTime: new Date('1970-01-01T08:30:00'),
      },
    ];

    const createdUsers: User[] = [];
    for (const userData of users) {
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email },
      });

      if (!existingUser) {
        const createdUser = await this.userRepository.save(userData);
        createdUsers.push(createdUser);
      }
    }

    return {
      success: true,
      message: `Created ${createdUsers.length} users`,
      count: createdUsers.length,
    };
  }

  async seedAllergies() {
    const allergies = [
      {
        name: 'Peanut Allergy',
        description: 'Allergic reaction to peanuts and peanut products',
        category: 'food',
        allergenType: 'peanuts',
        commonSymptoms: 'Hives, swelling, difficulty breathing, anaphylaxis',
        severity: 'severe',
        crossReactivity: 'Tree nuts, legumes',
        avoidanceAdvice:
          'Avoid all peanut products and cross-contaminated foods',
        requiresEpiPen: true,
        emergencyInfo: 'Carry epinephrine auto-injector at all times',
        isActive: true,
      },
      {
        name: 'Shellfish Allergy',
        description:
          'Allergic reaction to shellfish including shrimp, crab, lobster',
        category: 'food',
        allergenType: 'shellfish',
        commonSymptoms: 'Itching, hives, nausea, vomiting, diarrhea',
        severity: 'moderate',
        crossReactivity: 'Crustaceans and mollusks',
        avoidanceAdvice: 'Avoid all shellfish and seafood',
        requiresEpiPen: false,
        emergencyInfo:
          'Seek immediate medical attention if severe symptoms occur',
        isActive: true,
      },
      {
        name: 'Dust Mite Allergy',
        description: 'Allergic reaction to dust mites in household dust',
        category: 'environmental',
        allergenType: 'dust mites',
        commonSymptoms: 'Sneezing, runny nose, itchy eyes, congestion',
        severity: 'mild',
        crossReactivity: 'Other mites',
        avoidanceAdvice:
          'Use allergen-proof bedding, wash bedding weekly in hot water',
        requiresEpiPen: false,
        emergencyInfo:
          'Use antihistamines and nasal corticosteroids as prescribed',
        isActive: true,
      },
      {
        name: 'Penicillin Allergy',
        description: 'Allergic reaction to penicillin antibiotics',
        category: 'medication',
        allergenType: 'penicillin',
        commonSymptoms: 'Rash, hives, swelling, difficulty breathing',
        severity: 'moderate',
        crossReactivity: 'Other beta-lactam antibiotics',
        avoidanceAdvice: 'Avoid penicillin and related antibiotics',
        requiresEpiPen: false,
        emergencyInfo: 'Inform all healthcare providers of this allergy',
        isActive: true,
      },
      {
        name: 'Latex Allergy',
        description: 'Allergic reaction to natural rubber latex',
        category: 'latex',
        allergenType: 'latex',
        commonSymptoms: 'Contact dermatitis, hives, anaphylaxis',
        severity: 'severe',
        crossReactivity: 'Banana, avocado, kiwi',
        avoidanceAdvice: 'Use latex-free products, wear medical alert bracelet',
        requiresEpiPen: true,
        emergencyInfo: 'Avoid latex products in medical and household items',
        isActive: true,
      },
    ];

    const createdAllergies: Allergy[] = [];
    for (const allergyData of allergies) {
      const existingAllergy = await this.allergyRepository.findOne({
        where: { name: allergyData.name },
      });

      if (!existingAllergy) {
        const createdAllergy = await this.allergyRepository.save(allergyData);
        createdAllergies.push(createdAllergy);
      } else {
        createdAllergies.push(existingAllergy);
      }
    }

    // Get all users to assign allergies
    const users = await this.userRepository.find();
    const userAllergies: Partial<UserAllergy>[] = [];

    // Assign some allergies to users
    for (const user of users) {
      const numAllergies = Math.floor(Math.random() * 3); // 0-2 allergies per user
      const shuffledAllergies = [...createdAllergies].sort(
        () => 0.5 - Math.random(),
      );
      const selectedAllergies = shuffledAllergies.slice(0, numAllergies);

      for (const allergy of selectedAllergies) {
        userAllergies.push({
          userId: user.id,
          allergyId: allergy.id,
        });
      }
    }

    const createdUserAllergies =
      await this.userAllergyRepository.save(userAllergies);

    return {
      success: true,
      message: `Created ${createdAllergies.length} allergies and ${createdUserAllergies.length} user allergy associations`,
      allergiesCount: createdAllergies.length,
      userAllergiesCount: createdUserAllergies.length,
    };
  }

  async seedHealthConditions() {
    const healthConditions = [
      {
        name: 'Diabetes Type 2',
        isActive: true,
      },
      {
        name: 'Hypertension',
        isActive: true,
      },
      {
        name: 'Asthma',
        isActive: true,
      },
      {
        name: 'Arthritis',
        isActive: true,
      },
      {
        name: 'Depression',
        isActive: true,
      },
      {
        name: 'Anxiety Disorder',
        isActive: true,
      },
      {
        name: 'Migraine',
        isActive: true,
      },
      {
        name: 'GERD',
        isActive: true,
      },
      {
        name: 'Obesity',
        isActive: true,
      },
      {
        name: 'Insomnia',
        isActive: true,
      },
    ];

    const createdHealthConditions: HealthCondition[] = [];
    for (const conditionData of healthConditions) {
      const existingCondition = await this.healthConditionRepository.findOne({
        where: { name: conditionData.name },
      });

      if (!existingCondition) {
        const createdCondition =
          await this.healthConditionRepository.save(conditionData);
        createdHealthConditions.push(createdCondition);
      } else {
        createdHealthConditions.push(existingCondition);
      }
    }

    // Get all users to assign health conditions
    const users = await this.userRepository.find();
    const userHealthConditions: Partial<UserHealthCondition>[] = [];

    // Assign some health conditions to users
    for (const user of users) {
      const numConditions = Math.floor(Math.random() * 4); // 0-3 conditions per user
      const shuffledConditions = [...createdHealthConditions].sort(
        () => 0.5 - Math.random(),
      );
      const selectedConditions = shuffledConditions.slice(0, numConditions);

      for (const condition of selectedConditions) {
        userHealthConditions.push({
          userId: user.id,
          healthConditionId: condition.id,
        });
      }
    }

    const createdUserHealthConditions =
      await this.userHealthConditionRepository.save(userHealthConditions);

    return {
      success: true,
      message: `Created ${createdHealthConditions.length} health conditions and ${createdUserHealthConditions.length} user health condition associations`,
      healthConditionsCount: createdHealthConditions.length,
      userHealthConditionsCount: createdUserHealthConditions.length,
    };
  }

  async seedHealthHabits() {
    const healthHabits = [
      {
        name: 'Complete Blood Count (CBC)',
        description:
          'Comprehensive blood test that evaluates overall health and detects disorders',
        icon: '🩸',
        bgImage: '/images/cbc-bg.jpg',
        color: '#FF6B6B',
        type: 'health' as const,
        isActive: true,
      },
      {
        name: 'Lipid Profile',
        description:
          'Blood test that measures cholesterol and triglyceride levels',
        icon: '❤️',
        bgImage: '/images/lipid-bg.jpg',
        color: '#4ECDC4',
        type: 'health' as const,
        isActive: true,
      },
      {
        name: 'Thyroid Function Test',
        description: 'Tests that measure how well thyroid gland is working',
        icon: '🦋',
        bgImage: '/images/thyroid-bg.jpg',
        color: '#45B7D1',
        type: 'health' as const,
        isActive: true,
      },
      {
        name: 'Liver Function Test',
        description: 'Blood tests that measure proteins and enzyme levels',
        icon: '🍃',
        bgImage: '/images/liver-bg.jpg',
        color: '#96CEB4',
        type: 'health' as const,
        isActive: true,
      },
      {
        name: 'Daily Water Intake',
        description: 'Track daily water consumption for better hydration',
        icon: '💧',
        bgImage: '/images/water-bg.jpg',
        color: '#74B9FF',
        type: 'habit' as const,
        isActive: true,
      },
    ];

    const createdHealthHabits: HealthHabit[] = [];
    for (const habitData of healthHabits) {
      const existingHabit = await this.healthHabitRepository.findOne({
        where: { name: habitData.name },
      });

      if (!existingHabit) {
        const createdHabit = await this.healthHabitRepository.save(habitData);
        createdHealthHabits.push(createdHabit);
      } else {
        createdHealthHabits.push(existingHabit);
      }
    }

    // Create test components for each health habit
    const testComponents: TestComponent[] = [];
    const labUnitReferences: Partial<LabUnitReference>[] = [];

    for (const habit of createdHealthHabits) {
      if (habit.name === 'Complete Blood Count (CBC)') {
        const components = [
          {
            componentName: 'Hemoglobin',
            resultType: 'QUANTITATIVE' as const,
            calculationFormula: null,
            normalRangeText: '13.5-17.5 g/dL (males), 12.0-15.5 g/dL (females)',
            contextFactors: 'Gender: Male/Female',
            labTestId: habit.id,
          },
          {
            componentName: 'White Blood Cell Count',
            resultType: 'QUANTITATIVE' as const,
            calculationFormula: null,
            normalRangeText: '4,500-11,000 cells/μL',
            contextFactors: null,
            labTestId: habit.id,
          },
          {
            componentName: 'Platelet Count',
            resultType: 'QUANTITATIVE' as const,
            calculationFormula: null,
            normalRangeText: '150,000-450,000 platelets/μL',
            contextFactors: null,
            labTestId: habit.id,
          },
        ];

        for (const component of components) {
          const savedComponent = (await this.testComponentRepository.save({
            ...component,
            habit: habit,
          })) as TestComponent;
          testComponents.push(savedComponent);

          // Add unit references for quantitative components
          if (component.componentName === 'Hemoglobin') {
            labUnitReferences.push({
              unit: 'g/dL',
              normalRangeMin: 13.5,
              normalRangeMax: 17.5,
              conversionFactor: null,
              component: savedComponent,
              componentId: savedComponent.id,
            });
          } else if (component.componentName === 'White Blood Cell Count') {
            labUnitReferences.push({
              unit: 'cells/μL',
              normalRangeMin: 4500,
              normalRangeMax: 11000,
              conversionFactor: null,
              component: savedComponent,
              componentId: savedComponent.id,
            });
          } else if (component.componentName === 'Platelet Count') {
            labUnitReferences.push({
              unit: 'platelets/μL',
              normalRangeMin: 150000,
              normalRangeMax: 450000,
              conversionFactor: null,
              component: savedComponent,
              componentId: savedComponent.id,
            });
          }
        }
      } else if (habit.name === 'Lipid Profile') {
        const components = [
          {
            componentName: 'Total Cholesterol',
            resultType: 'QUANTITATIVE' as const,
            calculationFormula: null,
            normalRangeText: 'Less than 200 mg/dL',
            contextFactors: 'Fasting required',
            labTestId: habit.id,
          },
          {
            componentName: 'HDL Cholesterol',
            resultType: 'QUANTITATIVE' as const,
            calculationFormula: null,
            normalRangeText: '40-60 mg/dL or higher',
            contextFactors: 'Fasting required',
            labTestId: habit.id,
          },
          {
            componentName: 'LDL Cholesterol',
            resultType: 'QUANTITATIVE' as const,
            calculationFormula: null,
            normalRangeText: 'Less than 100 mg/dL',
            contextFactors: 'Fasting required',
            labTestId: habit.id,
          },
        ];

        for (const component of components) {
          const savedComponent = (await this.testComponentRepository.save({
            ...component,
            habit: habit,
          })) as TestComponent;
          testComponents.push(savedComponent);

          labUnitReferences.push({
            unit: 'mg/dL',
            normalRangeMin:
              component.componentName === 'Total Cholesterol'
                ? null
                : component.componentName === 'HDL Cholesterol'
                  ? 40
                  : null,
            normalRangeMax:
              component.componentName === 'Total Cholesterol'
                ? 200
                : component.componentName === 'HDL Cholesterol'
                  ? null
                  : 100,
            conversionFactor: null,
            component: savedComponent,
            componentId: savedComponent.id,
          });
        }
      }
    }

    await this.labUnitReferenceRepository.save(labUnitReferences);

    return {
      success: true,
      message: `Created ${createdHealthHabits.length} health habits, ${testComponents.length} test components, and ${labUnitReferences.length} lab unit references`,
      healthHabitsCount: createdHealthHabits.length,
      testComponentsCount: testComponents.length,
      labUnitReferencesCount: labUnitReferences.length,
    };
  }

  async seedMedicines() {
    // Seed medicines from medication lib (detailed medicine info)
    const medicationMedicines = [
      {
        brandName: 'Tylenol',
        genericName: 'Acetaminophen',
        activeIngredients: ['Acetaminophen'],
        manufacturer: 'Johnson & Johnson',
        dosageForm: 'Tablet',
        strength: '500mg',
        drugClass: 'Analgesic',
        description: 'Pain reliever and fever reducer',
        isPrescriptionRequired: false,
      },
      {
        brandName: 'Advil',
        genericName: 'Ibuprofen',
        activeIngredients: ['Ibuprofen'],
        manufacturer: 'Pfizer',
        dosageForm: 'Tablet',
        strength: '200mg',
        drugClass: 'NSAID',
        description:
          'Nonsteroidal anti-inflammatory drug for pain and inflammation',
        isPrescriptionRequired: false,
      },
      {
        brandName: 'Lisinopril',
        genericName: 'Lisinopril',
        activeIngredients: ['Lisinopril'],
        manufacturer: 'AstraZeneca',
        dosageForm: 'Tablet',
        strength: '10mg',
        drugClass: 'ACE Inhibitor',
        description: 'Medication for high blood pressure and heart failure',
        isPrescriptionRequired: true,
      },
      {
        brandName: 'Metformin',
        genericName: 'Metformin',
        activeIngredients: ['Metformin Hydrochloride'],
        manufacturer: 'Bristol-Myers Squibb',
        dosageForm: 'Tablet',
        strength: '500mg',
        drugClass: 'Biguanide',
        description: 'Medication for type 2 diabetes',
        isPrescriptionRequired: true,
      },
      {
        brandName: 'Amoxicillin',
        genericName: 'Amoxicillin',
        activeIngredients: ['Amoxicillin'],
        manufacturer: 'GlaxoSmithKline',
        dosageForm: 'Capsule',
        strength: '500mg',
        drugClass: 'Penicillin Antibiotic',
        description: 'Antibiotic for bacterial infections',
        isPrescriptionRequired: true,
      },
    ];

    const createdMedicationMedicines: MedicationMedicine[] = [];
    for (const medicineData of medicationMedicines) {
      const existingMedicine = await this.medicationMedicineRepository.findOne({
        where: { brandName: medicineData.brandName },
      });

      if (!existingMedicine) {
        const createdMedicine =
          await this.medicationMedicineRepository.save(medicineData);
        createdMedicationMedicines.push(createdMedicine);
      }
    }

    // Seed medicines from medicine lib (simpler medicine info)
    const medicines = [
      {
        name: 'Aspirin',
        description: 'Pain reliever and anti-inflammatory',
        ingredients: ['Acetylsalicylic acid'],
        imageUrl: '/images/aspirin.jpg',
        isActive: true,
      },
      {
        name: 'Ibuprofen',
        description: 'NSAID for pain and inflammation',
        ingredients: ['Ibuprofen'],
        imageUrl: '/images/ibuprofen.jpg',
        isActive: true,
      },
      {
        name: 'Paracetamol',
        description: 'Pain reliever and fever reducer',
        ingredients: ['Paracetamol'],
        imageUrl: '/images/paracetamol.jpg',
        isActive: true,
      },
      {
        name: 'Vitamin D',
        description: 'Essential vitamin for bone health',
        ingredients: ['Cholecalciferol'],
        imageUrl: '/images/vitamin-d.jpg',
        isActive: true,
      },
      {
        name: 'Omega-3',
        description: 'Essential fatty acids for heart health',
        ingredients: ['Fish oil', 'EPA', 'DHA'],
        imageUrl: '/images/omega-3.jpg',
        isActive: true,
      },
    ];

    const createdMedicines: SimpleMedicine[] = [];
    for (const medicineData of medicines) {
      const existingMedicine = await this.medicineRepository.findOne({
        where: { name: medicineData.name },
      });

      if (!existingMedicine) {
        const createdMedicine =
          await this.medicineRepository.save(medicineData);
        createdMedicines.push(createdMedicine);
      }
    }

    return {
      success: true,
      message: `Created ${createdMedicationMedicines.length} medication medicines and ${createdMedicines.length} medicines`,
      medicationMedicinesCount: createdMedicationMedicines.length,
      medicinesCount: createdMedicines.length,
    };
  }

  async seedMedications() {
    // Get users and medicines
    const users = await this.userRepository.find();
    const medicines = await this.medicationMedicineRepository.find();

    if (users.length === 0 || medicines.length === 0) {
      return {
        success: false,
        message: 'Users or medicines not found. Please seed them first.',
      };
    }

    const userMedications: UserMedication[] = [];
    const medicationLogs: Partial<MedicationLog>[] = [];

    // Create user medications for some users
    for (const user of users.slice(0, 3)) {
      // Only first 3 users get medications
      const numMedications = Math.floor(Math.random() * 3) + 1; // 1-3 medications per user
      const shuffledMedicines = [...medicines].sort(() => 0.5 - Math.random());
      const selectedMedicines = shuffledMedicines.slice(0, numMedications);

      for (const medicine of selectedMedicines) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30)); // Started within last 30 days

        const userMedication: Partial<UserMedication> = {
          userId: user.id,
          medicineId: medicine.id,
          frequency: MedicationFrequency.TWICE_A_DAY,
          dosageType: MedicationDosageType.TABLET,
          morningDosage: 1.0,
          afternoonDosage: 1.0,
          eveningDosage: 0.0,
          nightDosage: 0.0,
          durationValue: 30,
          durationUnit: MedicationDurationUnit.DAYS,
          instruction: MedicationInstruction.WITH_FOOD,
          customInstruction: undefined,
          startDate: startDate,
          isActive: true,
        };

        const savedUserMedication = (await this.userMedicationRepository.save(
          userMedication,
        )) as unknown as UserMedication;
        userMedications.push(savedUserMedication);

        // Create medication logs for the past 7 days
        for (let i = 0; i < 7; i++) {
          const logDate = new Date();
          logDate.setDate(logDate.getDate() - i);

          // Morning dose
          if ((userMedication.morningDosage ?? 0) > 0) {
            medicationLogs.push({
              userMedication: savedUserMedication,
              logDate: logDate,
              timeTaken: new Date(logDate.getTime() + 8 * 60 * 60 * 1000), // 8 AM
              doseTimeOfDay: 'morning' as DoseTimeOfDay,
              dosageTaken: userMedication.morningDosage,
              wasTaken: Math.random() > 0.2, // 80% compliance
              notes: Math.random() > 0.8 ? 'Taken with breakfast' : undefined,
            });
          }

          // Afternoon dose
          if ((userMedication.afternoonDosage ?? 0) > 0) {
            medicationLogs.push({
              userMedication: savedUserMedication,
              logDate: logDate,
              timeTaken: new Date(logDate.getTime() + 14 * 60 * 60 * 1000), // 2 PM
              doseTimeOfDay: 'afternoon' as DoseTimeOfDay,
              dosageTaken: userMedication.afternoonDosage,
              wasTaken: Math.random() > 0.2, // 80% compliance
              notes: Math.random() > 0.8 ? 'Taken after lunch' : undefined,
            });
          }
        }
      }
    }

    const createdMedicationLogs =
      await this.medicationLogRepository.save(medicationLogs);

    return {
      success: true,
      message: `Created ${userMedications.length} user medications and ${createdMedicationLogs.length} medication logs`,
      userMedicationsCount: userMedications.length,
      medicationLogsCount: createdMedicationLogs.length,
    };
  }

  async seedUserHealthHabits() {
    // Get users and health habits
    const users = await this.userRepository.find();
    const healthHabits = await this.healthHabitRepository.find();

    if (users.length === 0 || healthHabits.length === 0) {
      return {
        success: false,
        message: 'Users or health habits not found. Please seed them first.',
      };
    }

    const userHealthHabits: Partial<UserHealthHabit>[] = [];
    const userHealthHabitData: Partial<UserHealthHabitData>[] = [];

    // Assign some health habits to users
    for (const user of users) {
      const numHabits = Math.floor(Math.random() * 4) + 2; // 2-5 habits per user
      const shuffledHabits = [...healthHabits].sort(() => 0.5 - Math.random());
      const selectedHabits = shuffledHabits.slice(0, numHabits);

      for (const habit of selectedHabits) {
        const userHabit = {
          userId: user.id,
          healthHabitId: habit.id.toString(),
          isFavorite: Math.random() > 0.7, // 30% are favorites
        };

        const savedUserHabit =
          await this.userHealthHabitRepository.save(userHabit);
        userHealthHabits.push(savedUserHabit);

        // Create sample data for the past 30 days for health habits (not daily habits)
        if (habit.type === 'health') {
          const testComponents = await this.testComponentRepository.find({
            where: { labTestId: habit.id },
          });

          for (let i = 0; i < 30; i += 7) {
            // Weekly health check data
            const dataDate = new Date();
            dataDate.setDate(dataDate.getDate() - i);

            for (const component of testComponents) {
              let resultValue: string;
              let numericResult: number | null = null;

              // Generate realistic sample values based on component
              if (component.componentName === 'Hemoglobin') {
                numericResult =
                  user.gender === 'male'
                    ? 14 + Math.random() * 3 // 14-17 g/dL for males
                    : 12 + Math.random() * 3; // 12-15 g/dL for females
                resultValue = numericResult.toFixed(1);
              } else if (component.componentName === 'White Blood Cell Count') {
                numericResult = 4500 + Math.random() * 6500; // 4500-11000
                resultValue = Math.round(numericResult).toString();
              } else if (component.componentName === 'Platelet Count') {
                numericResult = 150000 + Math.random() * 300000; // 150k-450k
                resultValue = Math.round(numericResult).toString();
              } else if (component.componentName === 'Total Cholesterol') {
                numericResult = 150 + Math.random() * 100; // 150-250 mg/dL
                resultValue = Math.round(numericResult).toString();
              } else if (component.componentName === 'HDL Cholesterol') {
                numericResult = 35 + Math.random() * 40; // 35-75 mg/dL
                resultValue = Math.round(numericResult).toString();
              } else if (component.componentName === 'LDL Cholesterol') {
                numericResult = 70 + Math.random() * 80; // 70-150 mg/dL
                resultValue = Math.round(numericResult).toString();
              } else {
                resultValue = 'Normal';
              }

              userHealthHabitData.push({
                healthHabitId: habit.id,
                userId: user.id,
                date: dataDate,
                resultValue: resultValue,
                numericResult: numericResult,
                reportedAt: new Date(
                  dataDate.getTime() + Math.random() * 24 * 60 * 60 * 1000,
                ), // Random time during the day
                unitUsed: component.componentName.includes('Cholesterol')
                  ? 'mg/dL'
                  : component.componentName === 'Hemoglobin'
                    ? 'g/dL'
                    : component.componentName === 'White Blood Cell Count'
                      ? 'cells/μL'
                      : component.componentName === 'Platelet Count'
                        ? 'platelets/μL'
                        : null,
                contextNote: Math.random() > 0.9 ? 'Fasting sample' : undefined,
                componentDefinition: component,
                componentDefinitionId: component.id,
              });
            }
          }
        }
      }
    }

    const createdUserHealthHabitData =
      await this.userHealthHabitDataRepository.save(userHealthHabitData);

    return {
      success: true,
      message: `Created ${userHealthHabits.length} user health habits and ${createdUserHealthHabitData.length} user health habit data entries`,
      userHealthHabitsCount: userHealthHabits.length,
      userHealthHabitDataCount: createdUserHealthHabitData.length,
    };
  }

  async seedTests() {
    const tests = [
      {
        name: 'Blood Glucose Test',
        description: 'Measures blood sugar levels for diabetes monitoring',
        metadata: { category: 'diabetes', frequency: 'daily' },
        options: { unit: 'mg/dL', normalRange: { min: 70, max: 140 } },
        isActive: true,
      },
      {
        name: 'Blood Pressure Measurement',
        description: 'Monitors systolic and diastolic blood pressure',
        metadata: { category: 'cardiovascular', frequency: 'daily' },
        options: {
          unit: 'mmHg',
          normalRange: {
            systolic: { min: 90, max: 120 },
            diastolic: { min: 60, max: 80 },
          },
        },
        isActive: true,
      },
      {
        name: 'Body Temperature',
        description: 'Measures body temperature for fever detection',
        metadata: { category: 'general', frequency: 'as_needed' },
        options: { unit: '°C', normalRange: { min: 36.1, max: 37.2 } },
        isActive: true,
      },
      {
        name: 'Heart Rate Monitor',
        description: 'Tracks resting heart rate and heart rate variability',
        metadata: { category: 'cardiovascular', frequency: 'daily' },
        options: { unit: 'bpm', normalRange: { min: 60, max: 100 } },
        isActive: true,
      },
      {
        name: 'Sleep Quality Assessment',
        description: 'Evaluates sleep duration and quality',
        metadata: { category: 'sleep', frequency: 'daily' },
        options: { unit: 'hours', normalRange: { min: 7, max: 9 } },
        isActive: true,
      },
    ];

    const createdTests: TestEntity[] = [];
    for (const testData of tests) {
      const existingTest = await this.testEntityRepository.findOne({
        where: { name: testData.name },
      });

      if (!existingTest) {
        const createdTest = await this.testEntityRepository.save(testData);
        createdTests.push(createdTest);
      }
    }

    return {
      success: true,
      message: `Created ${createdTests.length} test entities`,
      count: createdTests.length,
    };
  }
}
