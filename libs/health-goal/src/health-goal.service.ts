import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthGoal } from './entities/health-goal.entity';
import { UserHealthGoal } from './entities/user-health-goal.entity';
import {
    CreateHealthGoalDto,
    UpdateHealthGoalDto,
    AddUserHealthGoalDto,
    AddMultipleUserHealthGoalsDto,
} from './dto';

@Injectable()
export class HealthGoalService {
    constructor(
        @InjectRepository(HealthGoal)
        private readonly healthGoalRepository: Repository<HealthGoal>,
        @InjectRepository(UserHealthGoal)
        private readonly userHealthGoalRepository: Repository<UserHealthGoal>,
    ) { }

    /**
     * Create a new health goal
     * @param createDto - Data for creating a health goal
     * @returns The created health goal
     */
    async createHealthGoal(
        createDto: CreateHealthGoalDto,
    ): Promise<HealthGoal> {
        // Check if health goal with the same name already exists
        const existingGoal = await this.healthGoalRepository.findOne({
            where: { name: createDto.name },
        });

        if (existingGoal) {
            throw new ConflictException(
                `Health goal with name "${createDto.name}" already exists`,
            );
        }

        const healthGoal = this.healthGoalRepository.create({
            name: createDto.name,
            description: createDto.description,
            status: createDto.status,
        });

        return await this.healthGoalRepository.save(healthGoal);
    }

    /**
     * Update an existing health goal
     * @param id - Health goal ID
     * @param updateDto - Data for updating the health goal
     * @returns The updated health goal
     */
    async updateHealthGoal(
        id: string,
        updateDto: UpdateHealthGoalDto,
    ): Promise<HealthGoal> {
        const healthGoal = await this.healthGoalRepository.findOne({
            where: { id },
        });

        if (!healthGoal) {
            throw new NotFoundException(`Health goal with ID "${id}" not found`);
        }

        // If updating name, check for duplicates
        if (updateDto.name && updateDto.name !== healthGoal.name) {
            const existingGoal = await this.healthGoalRepository.findOne({
                where: { name: updateDto.name },
            });

            if (existingGoal) {
                throw new ConflictException(
                    `Health goal with name "${updateDto.name}" already exists`,
                );
            }
        }

        // Update fields
        if (updateDto.name !== undefined) {
            healthGoal.name = updateDto.name;
        }
        if (updateDto.description !== undefined) {
            healthGoal.description = updateDto.description;
        }
        if (updateDto.status !== undefined) {
            healthGoal.status = updateDto.status;
        }

        return await this.healthGoalRepository.save(healthGoal);
    }

    /**
     * Get a health goal by ID
     * @param id - Health goal ID
     * @returns The health goal
     */
    async getHealthGoalById(id: string): Promise<HealthGoal> {
        const healthGoal = await this.healthGoalRepository.findOne({
            where: { id },
        });

        if (!healthGoal) {
            throw new NotFoundException(`Health goal with ID "${id}" not found`);
        }

        return healthGoal;
    }

    /**
     * Get all health goals
     * @param search - Search term to filter health goals by name or description (optional)
     * @param limit - Maximum number of results to return (optional)
     * @returns List of health goals
     */
    async getAllHealthGoals(
        search?: string,
        limit?: number,
    ): Promise<HealthGoal[]> {
        const queryBuilder =
            this.healthGoalRepository.createQueryBuilder('healthGoal');

        // Search by name or description (case-insensitive)
        if (search) {
            queryBuilder.where(
                '(LOWER(healthGoal.name) LIKE LOWER(:search) OR LOWER(healthGoal.description) LIKE LOWER(:search))',
                { search: `%${search}%` },
            );
        }

        // Apply limit
        if (limit && limit > 0) {
            queryBuilder.limit(limit);
        }

        // Order by name
        queryBuilder.orderBy('healthGoal.name', 'ASC');

        return await queryBuilder.getMany();
    }

    /**
     * Delete a health goal
     * @param id - Health goal ID
     * @returns Success message
     */
    async deleteHealthGoal(id: string): Promise<{ message: string }> {
        const healthGoal = await this.getHealthGoalById(id);
        await this.healthGoalRepository.remove(healthGoal);

        return {
            message: 'Health goal successfully deleted',
        };
    }

    /**
     * Add a health goal to a user
     * User can provide either an existing healthGoalId or a new healthGoalName
     * @param userId - User ID
     * @param addDto - Data for adding user health goal
     * @returns The created user health goal
     */
    async addUserHealthGoal(
        userId: string,
        addDto: AddUserHealthGoalDto,
    ): Promise<UserHealthGoal> {
        // Validate that at least one field is provided
        if (!addDto.healthGoalId && !addDto.healthGoalName) {
            throw new BadRequestException(
                'Either healthGoalId or healthGoalName must be provided',
            );
        }

        let healthGoalId: string;

        // Case 1: User provides existing health goal ID
        if (addDto.healthGoalId) {
            const healthGoal = await this.healthGoalRepository.findOne({
                where: { id: addDto.healthGoalId },
            });

            if (!healthGoal) {
                throw new NotFoundException(
                    `Health goal with ID "${addDto.healthGoalId}" not found`,
                );
            }

            healthGoalId = healthGoal.id;
        }
        // Case 2: User provides a new health goal name
        else if (addDto.healthGoalName) {
            // Check if health goal already exists
            let healthGoal = await this.healthGoalRepository.findOne({
                where: { name: addDto.healthGoalName },
            });

            // If it doesn't exist, create it
            if (!healthGoal) {
                healthGoal = await this.createHealthGoal({
                    name: addDto.healthGoalName,
                    description: '',
                    status: 'active',
                });
            }

            healthGoalId = healthGoal.id;
        } else {
            throw new BadRequestException('Invalid input data');
        }

        // Check if user already has this health goal
        const existingUserHealthGoal = await this.userHealthGoalRepository.findOne({
            where: {
                userId,
                healthGoalId,
            },
        });

        if (existingUserHealthGoal) {
            throw new ConflictException('User already has this health goal assigned');
        }

        // Create user health goal
        const userHealthGoal = this.userHealthGoalRepository.create({
            userId,
            healthGoalId,
        });

        return await this.userHealthGoalRepository.save(userHealthGoal);
    }

    /**
     * Remove a health goal from a user
     * @param userId - User ID
     * @param healthGoalId - Health goal ID
     * @returns Success message
     */
    async removeUserHealthGoal(
        userId: string,
        healthGoalId: string,
    ): Promise<{ message: string }> {
        const userHealthGoal = await this.userHealthGoalRepository.findOne({
            where: {
                userId,
                healthGoalId,
            },
        });

        if (!userHealthGoal) {
            throw new NotFoundException(
                `Health goal assignment not found for user "${userId}" and health goal "${healthGoalId}"`,
            );
        }

        await this.userHealthGoalRepository.remove(userHealthGoal);

        return {
            message: 'Health goal successfully removed from user',
        };
    }

    /**
     * Get all health goals for a specific user
     * @param userId - User ID
     * @returns List of user health goals with related health goal data
     */
    async getUserHealthGoals(userId: string): Promise<UserHealthGoal[]> {
        return await this.userHealthGoalRepository.find({
            where: { userId },
            relations: ['healthGoal'],
        });
    }

    /**
     * Remove a user health goal by its ID
     * @param userHealthGoalId - UserHealthGoal ID
     * @returns Success message
     */
    async removeUserHealthGoalById(
        userHealthGoalId: string,
    ): Promise<{ message: string }> {
        const userHealthGoal = await this.userHealthGoalRepository.findOne({
            where: { id: userHealthGoalId },
        });

        if (!userHealthGoal) {
            throw new NotFoundException(
                `User health goal with ID "${userHealthGoalId}" not found`,
            );
        }

        await this.userHealthGoalRepository.remove(userHealthGoal);

        return {
            message: 'Health goal successfully removed from user',
        };
    }

    /**
     * Add multiple health goals to a user in a single operation
     * Each item can have either healthGoalId or healthGoalName
     * @param userId - User ID
     * @param addMultipleDto - Data containing array of health goals to add
     * @returns Object with success count, failed items, and created health goals
     */
    async addMultipleUserHealthGoals(
        userId: string,
        addMultipleDto: AddMultipleUserHealthGoalsDto,
    ): Promise<{
        successCount: number;
        failedCount: number;
        created: UserHealthGoal[];
        failed: Array<{ item: any; reason: string }>;
    }> {
        const created: UserHealthGoal[] = [];
        const failed: Array<{ item: any; reason: string }> = [];

        for (const healthGoalItem of addMultipleDto.healthGoals) {
            try {
                // Validate that at least one field is provided
                if (!healthGoalItem.healthGoalId && !healthGoalItem.healthGoalName) {
                    failed.push({
                        item: healthGoalItem,
                        reason: 'Either healthGoalId or healthGoalName must be provided',
                    });
                    continue;
                }

                let healthGoalId: string;

                // Case 1: User provides existing health goal ID
                if (healthGoalItem.healthGoalId) {
                    const healthGoal = await this.healthGoalRepository.findOne({
                        where: { id: healthGoalItem.healthGoalId },
                    });

                    if (!healthGoal) {
                        failed.push({
                            item: healthGoalItem,
                            reason: `Health goal with ID "${healthGoalItem.healthGoalId}" not found`,
                        });
                        continue;
                    }

                    healthGoalId = healthGoal.id;
                }
                // Case 2: User provides a new health goal name
                else if (healthGoalItem.healthGoalName) {
                    // Check if health goal already exists
                    let healthGoal = await this.healthGoalRepository.findOne({
                        where: { name: healthGoalItem.healthGoalName },
                    });

                    // If it doesn't exist, create it
                    if (!healthGoal) {
                        healthGoal = await this.createHealthGoal({
                            name: healthGoalItem.healthGoalName,
                            description: '',
                            status: 'active',
                        });
                    }

                    healthGoalId = healthGoal.id;
                } else {
                    failed.push({
                        item: healthGoalItem,
                        reason: 'Invalid input data',
                    });
                    continue;
                }

                // Check if user already has this health goal
                const existingUserHealthGoal = await this.userHealthGoalRepository.findOne({
                    where: {
                        userId,
                        healthGoalId,
                    },
                });

                if (existingUserHealthGoal) {
                    failed.push({
                        item: healthGoalItem,
                        reason: 'User already has this health goal assigned',
                    });
                    continue;
                }

                // Create user health goal
                const userHealthGoal = this.userHealthGoalRepository.create({
                    userId,
                    healthGoalId,
                });

                const savedUserHealthGoal =
                    await this.userHealthGoalRepository.save(userHealthGoal);
                created.push(savedUserHealthGoal);
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : 'Unknown error occurred';
                failed.push({
                    item: healthGoalItem,
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
