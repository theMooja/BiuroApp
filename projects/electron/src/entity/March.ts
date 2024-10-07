import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MonthlyEntity } from "./Monthly";
import { StopperEntity } from "./Stopper";

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

    @ManyToOne(() => MonthlyEntity, (monthly) => monthly.marches)
    monthly: MonthlyEntity;

    @OneToMany(() => StopperEntity, (stopper) => stopper.march)
    stoppers: StopperEntity[];
}

export interface IClient {
    id: number;
    name: string;
    monthlies: MonthlyEntity[];
}


