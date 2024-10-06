import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Monthly } from "./Monthly";

@Entity()
export class Client extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    @OneToMany(() => Monthly, monthly => monthly.client)
    monthlies: Monthly[];
}

export interface IClient {
    id: number;
    name: string;
    monthlies: Monthly[];
}


