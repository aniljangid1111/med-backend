import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('health_goals')
export class HealthGoal {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("varchar", { length: 255, unique: true })
    name: string;

    @Column("varchar", { length: 255 })
    description: string;

    @Column("varchar", { length: 255 })
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}