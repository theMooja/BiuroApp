/*
filtr do marszów
*/

import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MonthlyEntity } from "./Monthly";
import { StopperEntity } from "./Stopper";
import { StepType } from "./../interfaces";

@Entity({ name: 'marches' })
export class MarchEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    sequence: number;

    @Column({ default: 0 })
    weight: number;

    @Column({ default: 0 })
    value: number;

    @Column({
        type: 'enum',
        enum: StepType,
        default: StepType.GYR
    })
    type: StepType;

    @ManyToOne(() => MonthlyEntity, (monthly) => monthly.marches, {
        onDelete: 'CASCADE'
    })
    monthly: MonthlyEntity;

    @OneToMany(() => StopperEntity, (stopper) => stopper.march, {
        cascade: true
    })
    stoppers: StopperEntity[];

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    finishedAt: Date;
}





