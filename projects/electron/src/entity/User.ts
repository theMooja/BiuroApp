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

export const UserController = {
    get loggedUser(): IUserEntity {
        return this._loggedUser;
    },

    set loggedUser(user: IUserEntity) {
        this._loggedUser = user;
    },

    async getUsers(): Promise<UserEntity[]> {
        let users = await UserEntity.find();

        return users;
    },

    async saveUser(data: IUserEntity) {
        let user = await UserEntity.findOneBy({ name: data.name });
        if (!user) {
            user = new UserEntity();
        }
        user.name = data.name;
        user.password = data.password;
        await user.save();
    }
}

