import { User } from '@user/user/enitity/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { HealthGoal } from './health-goal.entity';

@Entity()
export class UserHealthGoal {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column('uuid')
    userId: string;

    @ManyToOne(() => HealthGoal)
    @JoinColumn({ name: 'healthGoalId' })
    healthGoal: HealthGoal;

    @Column('uuid')
    healthGoalId: string;

    @CreateDateColumn({ type: 'time with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'time with time zone' })
    updatedAt: Date;
}
