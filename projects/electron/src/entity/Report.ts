import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'reports' })
export class ReportEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;

    @Column()
    name: string;

    @Column('json', { default: {} })
    input: any;

    @Column('json', { default: {} })
    output: any;

    @CreateDateColumn()
    createdAt: Date;
}



