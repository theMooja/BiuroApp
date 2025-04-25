import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MonthlyEntity } from "./Monthly";

@Entity({ name: 'clients' })
export class ClientEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    nip: string;

    @OneToMany(() => MonthlyEntity, monthly => monthly.client)
    monthlies: MonthlyEntity[];

    @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
    details: {
        fakturowniaId: string,
        folderPath: string,
    }
}



