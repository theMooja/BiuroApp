import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Client } from "./Client";

@Entity()
export class Monthly extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Client, client => client.monthlies)
    client: Client;

    @Column({ nullable: false })
    year: number;

    @Column({ nullable: false })
    month: number;

    @Column({ default: '' })
    note: string;

    @Column({
        type: 'jsonb'
    })
    info: {
        email: string,
        podmiot: string,
        program: string,
        forma: string
    }
}