import { IUserEntity } from "./../interfaces";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Repository } from "typeorm";
import { StopperEntity } from "./Stopper";

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
}


