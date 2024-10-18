import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MonthlyEntity } from "./Monthly";
import { StopperEntity } from "./Stopper";
import { StepType } from "./../interfaces";

@Entity({ name: 'marches' })
export class MarchEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    @Column()
    sequence: number;

    @Column()
    weight: number;

    @Column()
    value: number;

    @Column({
        type: 'enum',
        enum: StepType,
        default: StepType.WORK
    })
    type: StepType;

    @ManyToOne(() => MonthlyEntity, (monthly) => monthly.marches)
    monthly: MonthlyEntity;

    @OneToMany(() => StopperEntity, (stopper) => stopper.march)
    stoppers: StopperEntity[];
}





