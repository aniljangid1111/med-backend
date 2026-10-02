import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthCondition } from './entities/health-condition.entity';
import { UserHealthCondition } from './entities/user-health-condition.entity';
import {
  CreateHealthConditionDto,
  UpdateHealthConditionDto,
  AddUserHealthConditionDto,
  AddMultipleUserHealthConditionsDto,
} from './dto';

@Injectable()
export class HealthConditionService {
  constructor(
    @InjectRepository(HealthCondition)
    private readonly healthConditionRepository: Repository<HealthCondition>,
    @InjectRepository(UserHealthCondition)
    private readonly userHealthConditionRepository: Repository<UserHealthCondition>,
  ) {}

  /**
   * Create a new health condition
   * @param createDto - Data for creating a health condition
   * @returns The created health condition
   */
  async createHealthCondition(
    createDto: CreateHealthConditionDto,
  ): Promise<HealthCondition> {
    // Check if health condition with the same name already exists
    const existingCondition = await this.healthConditionRepository.findOne({
      where: { name: createDto.name },
    });

    if (existingCondition) {
      throw new ConflictException(
        `Health condition with name "${createDto.name}" already exists`,
      );
    }

    const healthCondition = this.healthConditionRepository.create({
      name: createDto.name,
      isActive: createDto.isActive ?? true,
    });

    return await this.healthConditionRepository.save(healthCondition);
  }

  /**
   * Update an existing health condition
   * @param id - Health condition ID
   * @param updateDto - Data for updating the health condition
   * @returns The updated health condition
   */
  async updateHealthCondition(
    id: string,
    updateDto: UpdateHealthConditionDto,
  ): Promise<HealthCondition> {
    const healthCondition = await this.healthConditionRepository.findOne({
      where: { id },
    });

    if (!healthCondition) {
      throw new NotFoundException(`Health condition with ID "${id}" not found`);
    }

    // If updating name, check for duplicates
    if (updateDto.name && updateDto.name !== healthCondition.name) {
      const existingCondition = await this.healthConditionRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existingCondition) {
        throw new ConflictException(
          `Health condition with name "${updateDto.name}" already exists`,
        );
      }
    }

    // Update fields
    if (updateDto.name !== undefined) {
      healthCondition.name = updateDto.name;
    }
    if (updateDto.isActive !== undefined) {
      healthCondition.isActive = updateDto.isActive;
    }

    return await this.healthConditionRepository.save(healthCondition);
  }

  /**
   * Get a health condition by ID
   * @param id - Health condition ID
   * @returns The health condition
   */
  async getHealthConditionById(id: string): Promise<HealthCondition> {
    const healthCondition = await this.healthConditionRepository.findOne({
      where: { id },
    });

    if (!healthCondition) {
      throw new NotFoundException(`Health condition with ID "${id}" not found`);
    }

    return healthCondition;
  }

  /**
   * Get all health conditions
   * @param isActive - Filter by active status (optional)
   * @param limit - Maximum number of results to return (optional)
   * @param search - Search term to filter health conditions by name (optional)
   * @returns List of health conditions
   */
  async getAllHealthConditions(
    isActive?: boolean,
    limit?: number,
    search?: string,
  ): Promise<HealthCondition[]> {
    const queryBuilder =
      this.healthConditionRepository.createQueryBuilder('healthCondition');

    // Filter by active status
    if (isActive !== undefined) {
      queryBuilder.where('healthCondition.isActive = :isActive', { isActive });
    }

    // Search by name (case-insensitive)
    if (search) {
      const searchCondition = isActive !== undefined ? 'andWhere' : 'where';
      queryBuilder[searchCondition](
        'LOWER(healthCondition.name) LIKE LOWER(:search)',
        { search: `%${search}%` },
      );
    }

    // Apply limit
    if (limit && limit > 0) {
      queryBuilder.limit(limit);
    }

    // Order by name
    queryBuilder.orderBy('healthCondition.name', 'ASC');

    return await queryBuilder.getMany();
  }

  /**
   * Add a health condition to a user
   * User can provide either an existing healthConditionId or a new healthConditionName
   * @param userId - User ID
   * @param addDto - Data for adding user health condition
   * @returns The created user health condition
   */
  async addUserHealthCondition(
    userId: string,
    addDto: AddUserHealthConditionDto,
  ): Promise<UserHealthCondition> {
    // Validate that at least one field is provided
    if (!addDto.healthConditionId && !addDto.healthConditionName) {
      throw new BadRequestException(
        'Either healthConditionId or healthConditionName must be provided',
      );
    }

    let healthConditionId: string;

    // Case 1: User provides existing health condition ID
    if (addDto.healthConditionId) {
      const healthCondition = await this.healthConditionRepository.findOne({
        where: { id: addDto.healthConditionId },
      });

      if (!healthCondition) {
        throw new NotFoundException(
          `Health condition with ID "${addDto.healthConditionId}" not found`,
        );
      }

      healthConditionId = healthCondition.id;
    }
    // Case 2: User provides a new health condition name
    else if (addDto.healthConditionName) {
      // Check if health condition already exists
      let healthCondition = await this.healthConditionRepository.findOne({
        where: { name: addDto.healthConditionName },
      });

      // If it doesn't exist, create it
      if (!healthCondition) {
        healthCondition = await this.createHealthCondition({
          name: addDto.healthConditionName,
          isActive: true,
        });
      }

      healthConditionId = healthCondition.id;
    } else {
      throw new BadRequestException('Invalid input data');
    }

    // Check if user already has this health condition
    const existingUserHealthCondition =
      await this.userHealthConditionRepository.findOne({
        where: {
          userId,
          healthConditionId,
        },
      });

    if (existingUserHealthCondition) {
      throw new ConflictException(
        'User already has this health condition assigned',
      );
    }

    // Create user health condition
    const userHealthCondition = this.userHealthConditionRepository.create({
      userId,
      healthConditionId,
    });

    return await this.userHealthConditionRepository.save(userHealthCondition);
  }

  /**
   * Remove a health condition from a user
   * @param userId - User ID
   * @param healthConditionId - Health condition ID
   * @returns Success message
   */
  async removeUserHealthCondition(
    userId: string,
    healthConditionId: string,
  ): Promise<{ message: string }> {
    const userHealthCondition =
      await this.userHealthConditionRepository.findOne({
        where: {
          userId,
          healthConditionId,
        },
      });

    if (!userHealthCondition) {
      throw new NotFoundException(
        `Health condition assignment not found for user "${userId}" and health condition "${healthConditionId}"`,
      );
    }

    await this.userHealthConditionRepository.remove(userHealthCondition);

    return {
      message: 'Health condition successfully removed from user',
    };
  }

  /**
   * Get all health conditions for a specific user
   * @param userId - User ID
   * @returns List of user health conditions with related health condition data
   */
  async getUserHealthConditions(
    userId: string,
  ): Promise<UserHealthCondition[]> {
    return await this.userHealthConditionRepository.find({
      where: { userId },
      relations: ['healthCondition'],
    });
  }

  /**
   * Remove a user health condition by its ID
   * @param userHealthConditionId - UserHealthCondition ID
   * @returns Success message
   */
  async removeUserHealthConditionById(
    userHealthConditionId: string,
  ): Promise<{ message: string }> {
    const userHealthCondition =
      await this.userHealthConditionRepository.findOne({
        where: { id: userHealthConditionId },
      });

    if (!userHealthCondition) {
      throw new NotFoundException(
        `User health condition with ID "${userHealthConditionId}" not found`,
      );
    }

    await this.userHealthConditionRepository.remove(userHealthCondition);

    return {
      message: 'Health condition successfully removed from user',
    };
  }

  /**
   * Add multiple health conditions to a user in a single operation
   * Each item can have either healthConditionId or healthConditionName
   * @param userId - User ID
   * @param addMultipleDto - Data containing array of health conditions to add
   * @returns Object with success count, failed items, and created health conditions
   */
  async addMultipleUserHealthConditions(
    userId: string,
    addMultipleDto: AddMultipleUserHealthConditionsDto,
  ): Promise<{
    successCount: number;
    failedCount: number;
    created: UserHealthCondition[];
    failed: Array<{ item: any; reason: string }>;
  }> {
    const created: UserHealthCondition[] = [];
    const failed: Array<{ item: any; reason: string }> = [];

    for (const conditionItem of addMultipleDto.healthConditions) {
      try {
        // Validate that at least one field is provided
        if (
          !conditionItem.healthConditionId &&
          !conditionItem.healthConditionName
        ) {
          failed.push({
            item: conditionItem,
            reason:
              'Either healthConditionId or healthConditionName must be provided',
          });
          continue;
        }

        let healthConditionId: string;

        // Case 1: User provides existing health condition ID
        if (conditionItem.healthConditionId) {
          const healthCondition = await this.healthConditionRepository.findOne({
            where: { id: conditionItem.healthConditionId },
          });

          if (!healthCondition) {
            failed.push({
              item: conditionItem,
              reason: `Health condition with ID "${conditionItem.healthConditionId}" not found`,
            });
            continue;
          }

          healthConditionId = healthCondition.id;
        }
        // Case 2: User provides a new health condition name
        else if (conditionItem.healthConditionName) {
          // Check if health condition already exists
          let healthCondition = await this.healthConditionRepository.findOne({
            where: { name: conditionItem.healthConditionName },
          });

          // If it doesn't exist, create it
          if (!healthCondition) {
            healthCondition = await this.createHealthCondition({
              name: conditionItem.healthConditionName,
              isActive: true,
            });
          }

          healthConditionId = healthCondition.id;
        } else {
          failed.push({
            item: conditionItem,
            reason: 'Invalid input data',
          });
          continue;
        }

        // Check if user already has this health condition
        const existingUserHealthCondition =
          await this.userHealthConditionRepository.findOne({
            where: {
              userId,
              healthConditionId,
            },
          });

        if (existingUserHealthCondition) {
          failed.push({
            item: conditionItem,
            reason: 'User already has this health condition assigned',
          });
          continue;
        }

        // Create user health condition
        const userHealthCondition = this.userHealthConditionRepository.create({
          userId,
          healthConditionId,
        });

        const savedUserHealthCondition =
          await this.userHealthConditionRepository.save(userHealthCondition);
        created.push(savedUserHealthCondition);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        failed.push({
          item: conditionItem,
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
