import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./User";
import { MonthlyEntity } from "./Monthly";

@Entity({ name: 'notes' })
export class NoteEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @ManyToOne(() => UserEntity, user => user.stoppers, { nullable: true })
    user: UserEntity;

    @ManyToOne(() => MonthlyEntity, monthly => monthly.notes)
    monthly: MonthlyEntity;

    @Column()
    persists: boolean;

    @Column({nullable: true})
    dueDate: Date;
}



