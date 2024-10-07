import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MonthlyEntity } from "./Monthly";

@Entity({ name: 'clients' })
export class ClientEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    @OneToMany(() => MonthlyEntity, monthly => monthly.client)
    monthlies: MonthlyEntity[];
}

export interface IClient {
    id: number;
    name: string;
    monthlies: MonthlyEntity[];
}


