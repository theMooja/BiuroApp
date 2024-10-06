import { IUser } from "./../interfaces";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Repository } from "typeorm";

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column()
    password: string;
}

export const UserController = {
    get loggedUser(): IUser {
        return this._loggedUser;
    },

    set loggedUser(user: IUser) {
        this._loggedUser = user;
    },

    async getUsers(): Promise<UserEntity[]> {
        let users = await UserEntity.find();

        return users;
    },

    async saveUser(data: IUser) {
        let user = await UserEntity.findOneBy({ name: data.name });
        if (!user) {
            user = new UserEntity();
        }
        user.name = data.name;
        user.password = data.password;
        await user.save();
    }
}