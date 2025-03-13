import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'listvalues' })
export class ListValueEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    target: string;

    @Column({ nullable: true })
    value: string;

    @Column({ nullable: true })
    text: string;
    
    @Column({ nullable: true })
    sequence: number;
    
}



