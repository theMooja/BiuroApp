import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ClientEntity } from "./Client";
import { MarchEntity } from "./March";
import { AppDataSource } from "./../datasource";

@Entity({ name: 'monthlies' })
export class MonthlyEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ClientEntity, client => client.monthlies)
    client: ClientEntity;

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

    @OneToMany(() => MarchEntity, march => march.monthly)
    marches: MarchEntity[];
}

export const MonthlyController = {
    async getMonthlies(year: number, month: number): Promise<MonthlyEntity[]> {
        return await AppDataSource
            .getRepository(MonthlyEntity)
            .createQueryBuilder('m')
            .innerJoinAndSelect('m.marches', 'mar')
            .innerJoinAndSelect('mar.stoppers', 'stop')
            .where('m.month = :month AND m.year = :year', { month, year })
            .getMany();
    }
}