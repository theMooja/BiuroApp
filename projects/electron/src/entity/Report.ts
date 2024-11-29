import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'reports' })
export class ReportEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;

    @Column()
    name: string;

    @Column('text')
    input: string;

    @Column('text')
    output: string;

    @CreateDateColumn()
    createdAt: Date;
}



