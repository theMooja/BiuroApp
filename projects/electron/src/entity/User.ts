import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { StopperEntity } from "./Stopper";
import { NoteEntity } from "./Note";

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column()
    password: string;

    @OneToMany(() => StopperEntity, (stopper) => stopper.user)
    stoppers: StopperEntity[];

    @OneToMany(() => NoteEntity, (note) => note.user)
    notes: NoteEntity[];
}


