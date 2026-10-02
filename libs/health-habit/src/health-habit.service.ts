import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import {
  CreateHealthHabitDto,
  CreateTestComponentDto,
} from './dtos/create-health-habits.dto';
import {
  CreateCustomHealthHabitDto,
  UpdateCustomHealthHabitDto,
} from './dtos/create-custom-health-habit.dto';
import { HealthHabit } from './entity/health-habit.entity';
import { LabUnitReference } from './entity/lab-unit-reference.entity';
import { TestComponent } from './entity/test-components.entity';

@Injectable()
export class HealthHabitService {
  constructor(
    @InjectRepository(HealthHabit)
    private readonly healthHabitRepository: Repository<HealthHabit>,
  ) {}

  async findAll({
    search,
    type,
    userId,
  }: {
    search?: string;
    type?: HealthHabit['type'];
    userId?: string;
  } = {}): Promise<HealthHabit[]> {
    const query = this.healthHabitRepository
      .createQueryBuilder('healthHabit')
      .leftJoinAndSelect('healthHabit.components', 'component')
      .leftJoinAndSelect('component.unitReferences', 'unitReference')
      .where('healthHabit.isActive = :isActive', { isActive: true });

    if (userId) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('healthHabit.userId IS NULL').orWhere(
            'healthHabit.userId = :userId',
            { userId },
          );
        }),
      );
    } else {
      query.andWhere('healthHabit.userId IS NULL');
    }

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('healthHabit.name ILIKE :search')
            .orWhere('healthHabit.description ILIKE :search')
            .orWhere('component.componentName ILIKE :search');
        }),
      );
      query.setParameter('search', `%${search}%`);
    }

    if (type) {
      query.andWhere('healthHabit.type = :type', { type });
    }

    query
      .orderBy('healthHabit.name', 'ASC')
      .addOrderBy('component.componentName', 'ASC')
      .addOrderBy('unitReference.unit', 'ASC');

    return query.getMany();
  }

  async findAllPaginated({
    search,
    type,
    userId,
    page = 1,
    limit = 10,
  }: {
    search?: string;
    type?: HealthHabit['type'];
    userId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    data: HealthHabit[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.healthHabitRepository
      .createQueryBuilder('healthHabit')
      .leftJoinAndSelect('healthHabit.components', 'component')
      .leftJoinAndSelect('component.unitReferences', 'unitReference')
      .where('healthHabit.isActive = :isActive', { isActive: true });

    if (userId) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('healthHabit.userId IS NULL').orWhere(
            'healthHabit.userId = :userId',
            { userId },
          );
        }),
      );
    } else {
      query.andWhere('healthHabit.userId IS NULL');
    }

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('healthHabit.name ILIKE :search')
            .orWhere('healthHabit.description ILIKE :search')
            .orWhere('component.componentName ILIKE :search');
        }),
      );
      query.setParameter('search', `%${search}%`);
    }

    if (type) {
      query.andWhere('healthHabit.type = :type', { type });
    }

    query
      .orderBy('healthHabit.name', 'ASC')
      .addOrderBy('component.componentName', 'ASC')
      .addOrderBy('unitReference.unit', 'ASC');

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createCustomHealthHabit(
    dto: CreateCustomHealthHabitDto,
    userId: string,
  ): Promise<HealthHabit> {
    const savedHabit =
      await this.healthHabitRepository.manager.transaction<HealthHabit>(
        async (entityManager) => {
          const habitRepository = entityManager.getRepository(HealthHabit);
          const componentRepository = entityManager.getRepository(TestComponent);
          const unitReferenceRepository =
            entityManager.getRepository(LabUnitReference);

          const habitToSave = habitRepository.create({
            name: dto.name.trim(),
            description: dto.description?.trim() || null,
            color: dto.color && dto.color !== '#054646' ? dto.color : '#DAF3F0',
            isActive: true,
            type: dto.type,
            userId: userId,
            isCustom: true,
          });

          const persistedHabit = await habitRepository.save(habitToSave);

          if (Array.isArray(persistedHabit)) {
            throw new Error('Unexpected array when saving health habit');
          }

          const persistedComponents: TestComponent[] = [];
          for (const field of dto.fields) {
            if (!field.name || !field.name.trim()) continue;

            const componentToSave = componentRepository.create({
              componentName: field.name.trim(),
              resultType: 'QUANTITATIVE',
              normalRangeText: 'Standard',
              labTestId: persistedHabit.id,
              habit: persistedHabit,
            });

            const persistedComponent =
              await componentRepository.save(componentToSave);

            if (Array.isArray(persistedComponent)) {
              throw new Error('Unexpected array when saving component');
            }

            const unitRefToSave = unitReferenceRepository.create({
              unit: field.unit?.trim() || 'unit',
              component: persistedComponent,
              componentId: persistedComponent.id,
            });
            const persistedUnitRef =
              await unitReferenceRepository.save(unitRefToSave);
            persistedComponent.unitReferences = [persistedUnitRef];

            persistedComponents.push(persistedComponent);
          }

          persistedHabit.components = persistedComponents;
          return persistedHabit;
        },
      );

    return this.findOne(savedHabit.id);
  }

  async updateCustomHealthHabit(
    id: number,
    userId: string,
    dto: UpdateCustomHealthHabitDto,
  ): Promise<HealthHabit> {
    const habit = await this.findOne(id);
    if (!habit) throw new NotFoundException('Health habit not found');
    if (habit.userId && habit.userId !== userId) {
      throw new BadRequestException('Not authorized to edit this habit');
    }

    await this.healthHabitRepository.manager.transaction(
      async (entityManager) => {
        const habitRepo = entityManager.getRepository(HealthHabit);
        const compRepo = entityManager.getRepository(TestComponent);
        const unitRepo = entityManager.getRepository(LabUnitReference);

        if (dto.name) habit.name = dto.name.trim();
        if (dto.description !== undefined)
          habit.description = dto.description?.trim() || null;
        if (dto.color) habit.color = dto.color;
        if (dto.type) habit.type = dto.type;
        await habitRepo.save(habit);

        if (dto.fields && dto.fields.length > 0) {
          // 1. Fetch all existing components for this habit
          const existingComps = await compRepo.find({
            where: { habit: { id: habit.id } },
            relations: ['unitReferences'],
          });

          // 2. Identify which component IDs were retained from frontend
          const retainedCompIds = dto.fields
            .map((f) => f.id)
            .filter((compDefId): compDefId is string => Boolean(compDefId));

          // 3. Remove any components that were deleted by the user
          const compsToDelete = existingComps.filter(
            (c) => !retainedCompIds.includes(c.id),
          );

          if (compsToDelete.length > 0) {
            const deleteIds = compsToDelete.map((c) => c.id);

            // Delete readings referencing these components first to avoid FK RESTRICT violations
            await entityManager
              .createQueryBuilder()
              .delete()
              .from('user_health_habit_data')
              .where('componentDefinitionId IN (:...ids)', { ids: deleteIds })
              .execute();

            // Delete unit references explicitly
            for (const delComp of compsToDelete) {
              if (delComp.unitReferences && delComp.unitReferences.length > 0) {
                await unitRepo.remove(delComp.unitReferences);
              }
            }

            // Delete the components
            await compRepo.delete(deleteIds);
          }

          // 4. Update existing components or insert newly added components
          for (const field of dto.fields) {
            if (!field.name || !field.name.trim()) continue;

            let comp: TestComponent | null = null;
            if (field.id) {
              comp = existingComps.find((c) => c.id === field.id) || null;
              if (!comp) {
                comp = await compRepo.findOne({
                  where: { id: field.id, habit: { id: habit.id } },
                  relations: ['unitReferences'],
                });
              }
            }

            if (comp) {
              comp.componentName = field.name.trim();
              await compRepo.save(comp);

              if (field.unit) {
                if (comp.unitReferences && comp.unitReferences.length > 0) {
                  const unitRef = comp.unitReferences[0];
                  unitRef.unit = field.unit.trim();
                  await unitRepo.save(unitRef);
                } else {
                  const newUnit = unitRepo.create({
                    unit: field.unit.trim(),
                    component: comp,
                    componentId: comp.id,
                  });
                  await unitRepo.save(newUnit);
                }

                // Also update any existing readings' unitUsed to match new unit
                await entityManager
                  .createQueryBuilder()
                  .update('user_health_habit_data')
                  .set({ unitUsed: field.unit.trim() })
                  .where('componentDefinitionId = :compId', { compId: comp.id })
                  .execute();
              }
            } else {
              // Create new component if it was added (must provide labTestId: habit.id)
              const newComp = compRepo.create({
                componentName: field.name.trim(),
                resultType: 'QUANTITATIVE',
                normalRangeText: 'Standard',
                labTestId: habit.id,
                habit,
              });
              const savedComp = await compRepo.save(newComp);
              const newUnit = unitRepo.create({
                unit: field.unit?.trim() || 'unit',
                component: savedComp,
                componentId: savedComp.id,
              });
              await unitRepo.save(newUnit);
            }
          }
        }
      },
    );

    return this.findOne(id);
  }

  async findOne(id: number): Promise<HealthHabit> {
    const healthHabit = await this.healthHabitRepository
      .createQueryBuilder('healthHabit')
      .leftJoinAndSelect('healthHabit.components', 'component')
      .leftJoinAndSelect('component.unitReferences', 'unitReference')
      .where('healthHabit.id = :id', { id })
      .andWhere('healthHabit.isActive = :isActive', { isActive: true })
      .orderBy('component.componentName', 'ASC')
      .addOrderBy('unitReference.unit', 'ASC')
      .getOne();

    if (!healthHabit) {
      throw new NotFoundException('Health habit not found');
    }

    return healthHabit;
  }

  async create(
    healthHabit: CreateHealthHabitDto,
    icon?: string,
    bgImage?: string,
  ): Promise<HealthHabit> {
    const components: CreateTestComponentDto[] = healthHabit.components ?? [];

    const savedHealthHabit =
      await this.healthHabitRepository.manager.transaction<HealthHabit>(
        async (entityManager) => {
          const habitRepository = entityManager.getRepository(HealthHabit);
          const componentRepository =
            entityManager.getRepository(TestComponent);
          const unitReferenceRepository =
            entityManager.getRepository(LabUnitReference);

          const habitToSave = habitRepository.create({
            name: healthHabit.name,
            description: healthHabit.description ?? null,
            icon: icon ?? healthHabit.icon ?? null,
            bgImage: bgImage ?? healthHabit.bgImage ?? null,
            color: healthHabit.color ?? null,
            isActive: healthHabit.isActive ?? true,
            type: healthHabit.type,
          });

          const persistedHabit = await habitRepository.save(habitToSave);

          if (Array.isArray(persistedHabit)) {
            throw new Error('Unexpected array when saving health habit');
          }

          if (!components.length) {
            persistedHabit.components = [];
            return persistedHabit;
          }

          const persistedComponents: TestComponent[] = [];

          for (const component of components) {
            const { unitReferences = [], ...componentData } = component;

            if (!componentData.labTestId) {
              throw new BadRequestException(
                'labTestId is required to create a test component',
              );
            }

            const componentToSave = componentRepository.create({
              ...componentData,
              calculationFormula: componentData.calculationFormula ?? null,
              contextFactors: componentData.contextFactors ?? null,
              resultType: componentData.resultType ?? 'QUANTITATIVE',
              habit: persistedHabit,
            });

            const persistedComponent =
              await componentRepository.save(componentToSave);

            if (Array.isArray(persistedComponent)) {
              throw new Error('Unexpected array when saving test component');
            }

            if (unitReferences.length) {
              const unitRefsToSave = unitReferences.map((unitReference) =>
                unitReferenceRepository.create({
                  unit: unitReference.unit,
                  normalRangeMin: unitReference.normalRangeMin ?? null,
                  normalRangeMax: unitReference.normalRangeMax ?? null,
                  conversionFactor: unitReference.conversionFactor ?? null,
                  component: persistedComponent,
                  componentId: persistedComponent.id,
                }),
              );
              persistedComponent.unitReferences =
                await unitReferenceRepository.save(unitRefsToSave);
            } else {
              persistedComponent.unitReferences = [];
            }

            persistedComponents.push(persistedComponent);
          }

          persistedHabit.components = persistedComponents;
          return persistedHabit;
        },
      );

    return this.findOne(savedHealthHabit.id);
  }

  async delete(id: number): Promise<void> {
    const healthHabit = await this.findOne(id);
    await this.healthHabitRepository.delete(healthHabit.id);
  }

  async deleteCustomHealthHabit(id: number, userId: string): Promise<void> {
    try {
      const habit = await this.healthHabitRepository.findOne({
        where: { id },
      });

      if (!habit) return;

      // Only allow deleting custom habit (habit with userId matching or unassigned)
      if (habit.userId && habit.userId !== userId) {
        throw new BadRequestException('Not authorized to delete this habit');
      }

      habit.isActive = false;
      await this.healthHabitRepository.save(habit);

      try {
        await this.healthHabitRepository.delete(habit.id);
      } catch {
        // Soft-deleted via isActive = false if foreign keys exist
      }
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
    }
  }
}
