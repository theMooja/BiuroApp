import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'listvalues' })
export class ListValueEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @Column()
    target: string;

    @Column({ nullable: true })
    sequence: number;
}



