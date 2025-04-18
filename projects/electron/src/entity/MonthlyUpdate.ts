import { BaseEntity, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'monthlyupdates' })
@Index(["monthlyId", "operation"], { unique: true })
export class MonthlyUpdateEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    monthlyId: number;

    @Column()
    operation: string;

    @CreateDateColumn()
    createdAt: Date;
}


