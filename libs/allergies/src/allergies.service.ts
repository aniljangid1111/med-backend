import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Allergy } from './entities/allergy.entity';
import { UserAllergy } from './entities/user-allergy.entity';
import {
  CreateAllergyDto,
  UpdateAllergyDto,
  AddUserAllergyDto,
  AddMultipleUserAllergiesDto,
} from './dto';

@Injectable()
export class AllergiesService {
  constructor(
    @InjectRepository(Allergy)
    private readonly allergyRepository: Repository<Allergy>,
    @InjectRepository(UserAllergy)
    private readonly userAllergyRepository: Repository<UserAllergy>,
  ) {}

  /**
   * Create a new allergy
   * @param createDto - Data for creating an allergy
   * @returns The created allergy
   */
  async createAllergy(createDto: CreateAllergyDto): Promise<Allergy> {
    // Check if allergy with the same name already exists
    const existingAllergy = await this.allergyRepository.findOne({
      where: { name: createDto.name },
    });

    if (existingAllergy) {
      throw new ConflictException(
        `Allergy with name "${createDto.name}" already exists`,
      );
    }

    const allergy = this.allergyRepository.create({
      name: createDto.name,
      description: createDto.description,
      category: createDto.category,
      allergenType: createDto.allergenType,
      commonSymptoms: createDto.commonSymptoms,
      severity: createDto.severity,
      crossReactivity: createDto.crossReactivity,
      avoidanceAdvice: createDto.avoidanceAdvice,
      requiresEpiPen: createDto.requiresEpiPen ?? false,
      emergencyInfo: createDto.emergencyInfo,
      isActive: createDto.isActive ?? true,
    });

    return await this.allergyRepository.save(allergy);
  }

  /**
   * Update an existing allergy
   * @param id - Allergy ID
   * @param updateDto - Data for updating the allergy
   * @returns The updated allergy
   */
  async updateAllergy(
    id: string,
    updateDto: UpdateAllergyDto,
  ): Promise<Allergy> {
    const allergy = await this.allergyRepository.findOne({
      where: { id },
    });

    if (!allergy) {
      throw new NotFoundException(`Allergy with ID "${id}" not found`);
    }

    // If updating name, check for duplicates
    if (updateDto.name && updateDto.name !== allergy.name) {
      const existingAllergy = await this.allergyRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existingAllergy) {
        throw new ConflictException(
          `Allergy with name "${updateDto.name}" already exists`,
        );
      }
    }

    // Update fields
    if (updateDto.name !== undefined) {
      allergy.name = updateDto.name;
    }
    if (updateDto.description !== undefined) {
      allergy.description = updateDto.description;
    }
    if (updateDto.category !== undefined) {
      allergy.category = updateDto.category;
    }
    if (updateDto.allergenType !== undefined) {
      allergy.allergenType = updateDto.allergenType;
    }
    if (updateDto.commonSymptoms !== undefined) {
      allergy.commonSymptoms = updateDto.commonSymptoms;
    }
    if (updateDto.severity !== undefined) {
      allergy.severity = updateDto.severity;
    }
    if (updateDto.crossReactivity !== undefined) {
      allergy.crossReactivity = updateDto.crossReactivity;
    }
    if (updateDto.avoidanceAdvice !== undefined) {
      allergy.avoidanceAdvice = updateDto.avoidanceAdvice;
    }
    if (updateDto.requiresEpiPen !== undefined) {
      allergy.requiresEpiPen = updateDto.requiresEpiPen;
    }
    if (updateDto.emergencyInfo !== undefined) {
      allergy.emergencyInfo = updateDto.emergencyInfo;
    }
    if (updateDto.isActive !== undefined) {
      allergy.isActive = updateDto.isActive;
    }

    return await this.allergyRepository.save(allergy);
  }

  /**
   * Get an allergy by ID
   * @param id - Allergy ID
   * @returns The allergy
   */
  async getAllergyById(id: string): Promise<Allergy> {
    const allergy = await this.allergyRepository.findOne({
      where: { id },
    });

    if (!allergy) {
      throw new NotFoundException(`Allergy with ID "${id}" not found`);
    }

    return allergy;
  }

  /**
   * Get all allergies
   * @param isActive - Filter by active status (optional)
   * @param limit - Maximum number of results to return (optional)
   * @param search - Search term to filter allergies by name (optional)
   * @returns List of allergies
   */
  async getAllAllergies(
    isActive?: boolean,
    limit?: number,
    search?: string,
  ): Promise<Allergy[]> {
    const queryBuilder = this.allergyRepository.createQueryBuilder('allergy');

    // Filter by active status
    if (isActive !== undefined) {
      queryBuilder.where('allergy.isActive = :isActive', { isActive });
    }

    // Search by name (case-insensitive)
    if (search) {
      const searchCondition = isActive !== undefined ? 'andWhere' : 'where';
      queryBuilder[searchCondition](
        'LOWER(allergy.name) LIKE LOWER(:search) OR LOWER(allergy.description) LIKE LOWER(:search) OR LOWER(allergy.category) LIKE LOWER(:search)',
        { search: `%${search}%` },
      );
    }

    // Apply limit
    if (limit && limit > 0) {
      queryBuilder.limit(limit);
    }

    // Order by name
    queryBuilder.orderBy('allergy.name', 'ASC');

    return await queryBuilder.getMany();
  }

  /**
   * Add an allergy to a user
   * User can provide either an existing allergyId or a new allergyName
   * @param userId - User ID
   * @param addDto - Data for adding user allergy
   * @returns The created user allergy
   */
  async addUserAllergy(
    userId: string,
    addDto: AddUserAllergyDto,
  ): Promise<UserAllergy> {
    // Validate that at least one field is provided
    if (!addDto.allergyId && !addDto.allergyName) {
      throw new BadRequestException(
        'Either allergyId or allergyName must be provided',
      );
    }

    let allergyId: string;

    // Case 1: User provides existing allergy ID
    if (addDto.allergyId) {
      const allergy = await this.allergyRepository.findOne({
        where: { id: addDto.allergyId },
      });

      if (!allergy) {
        throw new NotFoundException(
          `Allergy with ID "${addDto.allergyId}" not found`,
        );
      }

      allergyId = allergy.id;
    }
    // Case 2: User provides a new allergy name
    else if (addDto.allergyName) {
      // Check if allergy already exists
      let allergy = await this.allergyRepository.findOne({
        where: { name: addDto.allergyName },
      });

      // If it doesn't exist, create it
      if (!allergy) {
        allergy = await this.createAllergy({
          name: addDto.allergyName,
          isActive: true,
        });
      }

      allergyId = allergy.id;
    } else {
      throw new BadRequestException('Invalid input data');
    }

    // Check if user already has this allergy
    const existingUserAllergy = await this.userAllergyRepository.findOne({
      where: {
        userId,
        allergyId,
      },
    });

    if (existingUserAllergy) {
      throw new ConflictException('User already has this allergy assigned');
    }

    // Create user allergy
    const userAllergy = this.userAllergyRepository.create({
      userId,
      allergyId,
    });

    return await this.userAllergyRepository.save(userAllergy);
  }

  /**
   * Remove an allergy from a user
   * @param userId - User ID
   * @param allergyId - Allergy ID
   * @returns Success message
   */
  async removeUserAllergy(
    userId: string,
    allergyId: string,
  ): Promise<{ message: string }> {
    const userAllergy = await this.userAllergyRepository.findOne({
      where: {
        userId,
        allergyId,
      },
    });

    if (!userAllergy) {
      throw new NotFoundException(
        `Allergy assignment not found for user "${userId}" and allergy "${allergyId}"`,
      );
    }

    await this.userAllergyRepository.remove(userAllergy);

    return {
      message: 'Allergy successfully removed from user',
    };
  }

  /**
   * Get all allergies for a specific user
   * @param userId - User ID
   * @returns List of user allergies with related allergy data
   */
  async getUserAllergies(userId: string): Promise<UserAllergy[]> {
    return await this.userAllergyRepository.find({
      where: { userId },
      relations: ['allergy'],
    });
  }

  /**
   * Remove a user allergy by its ID
   * @param userAllergyId - UserAllergy ID
   * @returns Success message
   */
  async removeUserAllergyById(
    userAllergyId: string,
  ): Promise<{ message: string }> {
    const userAllergy = await this.userAllergyRepository.findOne({
      where: { id: userAllergyId },
    });

    if (!userAllergy) {
      throw new NotFoundException(
        `User allergy with ID "${userAllergyId}" not found`,
      );
    }

    await this.userAllergyRepository.remove(userAllergy);

    return {
      message: 'Allergy successfully removed from user',
    };
  }

  /**
   * Add multiple allergies to a user in a single operation
   * Each item can have either allergyId or allergyName
   * @param userId - User ID
   * @param addMultipleDto - Data containing array of allergies to add
   * @returns Object with success count, failed items, and created allergies
   */
  async addMultipleUserAllergies(
    userId: string,
    addMultipleDto: AddMultipleUserAllergiesDto,
  ): Promise<{
    successCount: number;
    failedCount: number;
    created: UserAllergy[];
    failed: Array<{ item: any; reason: string }>;
  }> {
    const created: UserAllergy[] = [];
    const failed: Array<{ item: any; reason: string }> = [];

    for (const allergyItem of addMultipleDto.allergies) {
      try {
        // Validate that at least one field is provided
        if (!allergyItem.allergyId && !allergyItem.allergyName) {
          failed.push({
            item: allergyItem,
            reason: 'Either allergyId or allergyName must be provided',
          });
          continue;
        }

        let allergyId: string;

        // Case 1: User provides existing allergy ID
        if (allergyItem.allergyId) {
          const allergy = await this.allergyRepository.findOne({
            where: { id: allergyItem.allergyId },
          });

          if (!allergy) {
            failed.push({
              item: allergyItem,
              reason: `Allergy with ID "${allergyItem.allergyId}" not found`,
            });
            continue;
          }

          allergyId = allergy.id;
        }
        // Case 2: User provides a new allergy name
        else if (allergyItem.allergyName) {
          // Check if allergy already exists
          let allergy = await this.allergyRepository.findOne({
            where: { name: allergyItem.allergyName },
          });

          // If it doesn't exist, create it
          if (!allergy) {
            allergy = await this.createAllergy({
              name: allergyItem.allergyName,
              isActive: true,
            });
          }

          allergyId = allergy.id;
        } else {
          failed.push({
            item: allergyItem,
            reason: 'Invalid input data',
          });
          continue;
        }

        // Check if user already has this allergy
        const existingUserAllergy = await this.userAllergyRepository.findOne({
          where: {
            userId,
            allergyId,
          },
        });

        if (existingUserAllergy) {
          failed.push({
            item: allergyItem,
            reason: 'User already has this allergy assigned',
          });
          continue;
        }

        // Create user allergy
        const userAllergy = this.userAllergyRepository.create({
          userId,
          allergyId,
        });

        const savedUserAllergy =
          await this.userAllergyRepository.save(userAllergy);
        created.push(savedUserAllergy);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        failed.push({
          item: allergyItem,
          reason: errorMessage,
        });
      }
    }

    return {
      successCount: created.length,
      failedCount: failed.length,
      created,
      failed,
    };
  }
}
