import { UserEntity } from "../entity/User";
import { IUserEntity } from "../interfaces";
import * as settings from 'electron-settings';

export const UserController = {
    get loggedUser(): UserEntity {
        return this._loggedUser;
    },

    set loggedUser(user: UserEntity) {
        this._loggedUser = user;
    },

    async setLoggedUser(user: IUserEntity) {
        this.loggedUser = await UserEntity.findOneBy({ name: user.name });
        settings.set('lastUserName', user.name);
    },

    async getUsers(): Promise<IUserEntity[]> {
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
        user.permission = data.permission;

        return await user.save();
    }
}